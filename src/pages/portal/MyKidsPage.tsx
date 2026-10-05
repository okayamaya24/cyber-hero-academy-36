import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAccountType } from "@/hooks/useAccountType";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  KeyRound,
  Printer,
  Copy,
  Users,
  CheckCircle2,
  Award,
  MessageCircle,
  GraduationCap,
  Star,
  AlertCircle,
  Trophy,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { MISSIONS, ALL_BADGES } from "@/data/missions";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { motion } from "framer-motion";
import { generateKidPassword } from "@/lib/kidPassword";
import { generatePicturePassword, picturesToEmoji, picturesToLabel } from "@/lib/picturePassword";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

interface StudentLogin {
  name: string;
  username: string;
  /** Only known right after creating or resetting an account */
  password?: string;
  /** Secret pictures for class code login, e.g. "dog,pizza" */
  pictures?: string;
  classCode?: string;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function printLoginCards(logins: StudentLogin[]) {
  const win = window.open("", "_blank");
  if (!win) {
    toast.error("Please allow pop-ups to print login cards");
    return;
  }
  const origin = escapeHtml(window.location.origin);
  const cards = logins
    .map((l) => {
      const pictureLogin =
        l.classCode && l.pictures
          ? `<div class="section"><p class="how">🎒 Log in with your class code</p>
             <p>Go to <b>${origin}/class-login</b></p>
             <p>Class code: <b class="code">${escapeHtml(l.classCode)}</b></p>
             <p>Tap your hero, then your secret pictures:</p>
             <p class="pics">${escapeHtml(picturesToEmoji(l.pictures))}</p>
             <p class="small">(${escapeHtml(picturesToLabel(l.pictures))})</p></div>`
          : "";
      const passwordLogin = l.password
        ? `<div class="section"><p class="how">🔑 Or log in with a password</p>
           <p>Username: <b>${escapeHtml(l.username)}</b></p>
           <p>Password: <b>${escapeHtml(l.password)}</b></p></div>`
        : "";
      return `<div class="card"><h2>${escapeHtml(l.name)}</h2>${pictureLogin}${passwordLogin}</div>`;
    })
    .join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Student Logins</title><style>
    body{font-family:system-ui,sans-serif;margin:24px}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
    .card{border:2px dashed #999;border-radius:12px;padding:12px 16px;break-inside:avoid}
    .section+.section{border-top:1px solid #ddd;margin-top:8px;padding-top:8px}
    h2{margin:0 0 8px;font-size:20px} p{margin:4px 0;font-size:14px} b{font-family:monospace;font-size:15px}
    .how{font-weight:700} .code{font-size:20px;letter-spacing:3px} .pics{font-size:40px;margin:6px 0} .small{color:#666;font-size:12px}
  </style></head><body><h1>🛡️ Cyber Hero Academy — Student Logins</h1><div class="grid">${cards}</div></body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

function downloadLoginsCsv(logins: StudentLogin[]) {
  const quote = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["name", "username", "password", "class_code", "secret_pictures"],
    ...logins.map((l) => [
      l.name,
      l.username,
      l.password ?? "",
      l.classCode ?? "",
      l.pictures ? picturesToLabel(l.pictures) : "",
    ]),
  ];
  const blob = new Blob([rows.map((r) => r.map(quote).join(",")).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-logins.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Set (or replace) a student's secret pictures and clear any lockout. */
async function savePicturePassword(childId: string, pictures: string) {
  const { error } = await (supabase as any).from("student_picture_passwords").upsert({
    child_id: childId,
    pictures,
    failed_attempts: 0,
    locked_until: null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

interface KidForm {
  name: string;
  age: string;
  username: string;
  password: string;
}
const emptyForm: KidForm = { name: "", age: "", username: "", password: "" };

const GRADE_TO_AGE: Record<string, number> = {
  K: 5,
  "1": 6,
  "2": 7,
  "3": 8,
  "4": 9,
  "5": 10,
  "6": 11,
  "7": 12,
  "8": 13,
};

function generateUsername(first: string, last: string, grade: string): string {
  return `${first.toLowerCase().slice(0, 5)}${last.toLowerCase().slice(0, 1)}${grade}`.replace(/\s+/g, "");
}

const conversationStarters: Record<string, string> = {
  "Spot the Scam!": "Ask your child: 'If you got a message saying you won a prize, what would you do?'",
  "Password Power":
    "Try this: 'Can you make up a silly sentence to use as a password? Like PurpleDinosaur-Eats-Pizza42!'",
  "Safe Sites Explorer": "Ask: 'How can you tell if a website is safe before clicking?'",
  "Secret Keeper": "Discuss: 'What information should we never share online with strangers?'",
  "Malware Monsters": "Ask: 'What would you do if a pop-up said your tablet has a virus?'",
  "Phishy Messages": "Try: 'Let's look at an email together — can you spot anything suspicious?'",
};

const parentTips = [
  "Review progress weekly and celebrate improvements",
  "Use the conversation starters to talk about online safety",
  "Celebrate badge achievements together",
  "Set a regular time for cybersecurity learning",
  "Explore the missions yourself to understand what they're learning",
];

const teacherTips = [
  "Review class progress weekly and identify students who need support",
  "Use discussion prompts to start classroom conversations about online safety",
  "Celebrate top performers and badge achievements with the class",
  "Assign specific missions as homework for focused learning",
  "Use the leaderboard to motivate friendly competition",
];

const discussionPrompts = [
  "What should you do if a stranger online asks for your address or school name?",
  "How can you tell if a website is trustworthy?",
  "Why is it important to have different passwords for different accounts?",
  "What would you do if someone sent you a mean message online?",
  "How can you protect your privacy when using social media?",
];

export default function MyKidsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { terms, isSchool } = useAccountType();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<KidForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetStudent, setResetStudent] = useState<{ id: string; name: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("");
  const [studentClassId, setStudentClassId] = useState("");
  const [studentPassword, setStudentPassword] = useState(generateKidPassword);
  const [newLogins, setNewLogins] = useState<StudentLogin[] | null>(null);

  // Classes query (teacher only)
  const { data: classes = [] } = useQuery({
    queryKey: ["classes", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("classes")
        .select("*")
        .eq("teacher_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data as { id: string; name: string; grade: string; login_code?: string }[];
    },
    enabled: !!user && isSchool,
  });

  const createClassMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("classes").insert({
        teacher_id: user!.id,
        name: newClassName.trim(),
        grade: newClassGrade,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setNewClassDialogOpen(false);
      setNewClassName("");
      setNewClassGrade("");
      toast.success("Class created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("parent_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Filter children by selected class
  const filteredChildren = useMemo(() => {
    if (!isSchool || selectedClassId === "all") return children;
    return children.filter((c) => (c as any).class_id === selectedClassId);
  }, [children, selectedClassId, isSchool]);

  const childIds = useMemo(() => filteredChildren.map((c) => c.id), [filteredChildren]);
  const allChildIds = useMemo(() => children.map((c) => c.id), [children]);

  const { data: allProgress = [] } = useQuery({
    queryKey: ["all_mission_progress", user?.id, allChildIds.join(",")],
    queryFn: async () => {
      if (allChildIds.length === 0) return [];
      const { data, error } = await supabase.from("mission_progress").select("*").in("child_id", allChildIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && allChildIds.length > 0,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["all_badges", user?.id, allChildIds.join(",")],
    queryFn: async () => {
      if (allChildIds.length === 0) return [];
      const { data, error } = await supabase.from("earned_badges").select("*").in("child_id", allChildIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && allChildIds.length > 0,
  });

  const filteredProgress = useMemo(
    () => allProgress.filter((p) => childIds.includes(p.child_id)),
    [allProgress, childIds],
  );

  const filteredBadges = useMemo(() => allBadges.filter((b) => childIds.includes(b.child_id)), [allBadges, childIds]);

  const getChildMissions = (childId: string) => filteredProgress.filter((p) => p.child_id === childId);
  const getChildBadges = (childId: string) => filteredBadges.filter((b) => b.child_id === childId);

  const getChildSummary = (childId: string) => {
    const childMissions = getChildMissions(childId);
    const completedMissions = childMissions.filter((m) => m.status === "completed");
    const totalStars = completedMissions.reduce((acc, m) => {
      const ratio = m.max_score > 0 ? m.score / m.max_score : 0;
      return acc + (ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1);
    }, 0);
    let strongestTopic = "—";
    let needsReviewTopic = "—";
    let bestScore = -1;
    let worstScore = Infinity;
    for (const m of childMissions) {
      const mission = MISSIONS.find((mi) => mi.id === m.mission_id);
      if (!mission) continue;
      const ratio = m.max_score > 0 ? m.score / m.max_score : 0;
      if (ratio > bestScore) {
        bestScore = ratio;
        strongestTopic = mission.title;
      }
      if (ratio < worstScore) {
        worstScore = ratio;
        needsReviewTopic = mission.title;
      }
    }
    return { completedCount: completedMissions.length, totalStars, strongestTopic, needsReviewTopic };
  };

  const totalMissionsDone = filteredProgress.filter((p) => p.status === "completed").length;
  const totalBadgesEarned = filteredBadges.length;

  const areasNeedingReview = useMemo(() => {
    if (filteredChildren.length === 0) return [];
    const areas: { missionTitle: string; childNames: string[]; status: string }[] = [];
    for (const mission of MISSIONS) {
      const needingWork: string[] = [];
      let worstStatus = "completed";
      for (const child of filteredChildren) {
        const progress = filteredProgress.find((p) => p.child_id === child.id && p.mission_id === mission.id);
        if (!progress) {
          needingWork.push(child.name);
          worstStatus = "not started";
        } else if (progress.status !== "completed") {
          needingWork.push(child.name);
          if (worstStatus !== "not started") worstStatus = "in progress";
        } else if (progress.score < progress.max_score * 0.7) {
          needingWork.push(child.name);
          if (worstStatus === "completed") worstStatus = "needs review";
        }
      }
      if (needingWork.length > 0)
        areas.push({ missionTitle: mission.title, childNames: needingWork, status: worstStatus });
    }
    return areas.slice(0, 6);
  }, [filteredChildren, filteredProgress]);

  const conversationStarter = useMemo(() => {
    if (areasNeedingReview.length === 0) return discussionPrompts[Math.floor(Math.random() * discussionPrompts.length)];
    const topic = areasNeedingReview[0];
    return (
      conversationStarters[topic.missionTitle] ||
      `Talk with your students about "${topic.missionTitle}" — they could use some extra practice!`
    );
  }, [areasNeedingReview]);

  const certProgress = useMemo(() => {
    const total = ALL_BADGES.length;
    const earned = new Set(filteredBadges.map((b) => b.badge_id)).size;
    return { earned, total, percent: total > 0 ? Math.round((earned / total) * 100) : 0 };
  }, [filteredBadges]);

  const recentBadges = useMemo(() => {
    return [...filteredBadges]
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 8);
  }, [filteredBadges]);

  const leaderboard = useMemo(() => {
    if (!isSchool) return [];
    return [...filteredChildren]
      .map((c) => ({ ...c, completedCount: getChildMissions(c.id).filter((m) => m.status === "completed").length }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [filteredChildren, filteredProgress, isSchool]);

  const classAverage = useMemo(() => {
    if (!isSchool || filteredChildren.length === 0) return 0;
    const totalPossible = filteredChildren.length * MISSIONS.length;
    if (totalPossible === 0) return 0;
    return Math.round((totalMissionsDone / totalPossible) * 100);
  }, [isSchool, filteredChildren, totalMissionsDone]);

  const autoUsername = isSchool ? generateUsername(firstName, lastName, grade) : form.username;
  const autoPassword = isSchool ? studentPassword : form.password;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");
      const { data: parentSession } = await supabase.auth.getSession();
      const parentAccessToken = parentSession.session?.access_token;
      const parentRefreshToken = parentSession.session?.refresh_token;

      const u = isSchool ? autoUsername : form.username.trim().toLowerCase();
      const pwd = isSchool ? autoPassword : form.password;
      const name = isSchool ? `${firstName.trim()} ${lastName.trim()}` : form.name.trim();
      const age = isSchool ? (GRADE_TO_AGE[grade] ?? 8) : form.age ? parseInt(form.age) : 7;

      if (!u) throw new Error("Username is required");
      if (!pwd || pwd.length < 8) throw new Error("Password must be at least 8 characters");
      if (!name) throw new Error("Name is required");

      const fakeEmail = `${u}@cyberhero.app`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: pwd,
        options: { data: { name, role: "kid" } },
      });
      if (signUpError) {
        if (signUpError.message.includes("already registered")) throw new Error("That username is already taken");
        throw signUpError;
      }
      const kidId = signUpData.user?.id;
      if (!kidId) throw new Error("Failed to create account");

      if (parentAccessToken && parentRefreshToken) {
        await supabase.auth.setSession({ access_token: parentAccessToken, refresh_token: parentRefreshToken });
      }

      await supabase
        .from("profiles")
        .upsert({ id: kidId, user_id: kidId, role: "kid", account_type: "kid", display_name: name, email: fakeEmail });
      await supabase.from("child_profiles").insert({
        id: kidId,
        parent_id: user.id,
        name,
        age,
        learning_mode: "standard",
        avatar: "🦸",
        level: 1,
        points: 0,
        streak: 0,
        ...(isSchool && studentClassId ? { class_id: studentClassId } : {}),
      });
      await supabase.from("parent_kid_links").insert({ parent_id: user.id, kid_id: kidId });

      let pictures: string | undefined;
      if (isSchool) {
        pictures = generatePicturePassword();
        await savePicturePassword(kidId, pictures);
      }
      const classCode = classes.find((c) => c.id === studentClassId)?.login_code;

      return { username: u, name, password: pwd, pictures, classCode } as StudentLogin;
    },
    onSuccess: (result) => {
      if (isSchool) {
        setNewLogins([result]);
        setStudentPassword(generateKidPassword());
      }
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setDrawerOpen(false);
      setForm(emptyForm);
      setFirstName("");
      setLastName("");
      setGrade("");
      setStudentClassId("");
      toast.success(`${result.name} added! Login: ${result.username}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const moveToClassMutation = useMutation({
    mutationFn: async ({ childId, classId }: { childId: string; classId: string | null }) => {
      const { error } = await supabase.from("child_profiles").update({ class_id: classId }).eq("id", childId);
      if (error) throw error;
      return classId;
    },
    onSuccess: (classId) => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      const cls = classes.find((c) => c.id === classId);
      toast.success(cls ? `Moved to ${cls.name}` : "Removed from class");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("child_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["all_mission_progress"] });
      queryClient.invalidateQueries({ queryKey: ["all_badges"] });
      setDeleteId(null);
      toast.success(`${terms.kidSingular} removed.`);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (student: { id: string; name: string }) => {
      const { data, error } = await supabase.functions.invoke("reset-student-password", {
        body: { studentId: student.id },
      });
      if (error) {
        // Surface the function's own message (e.g. "Please log in again") when there is one
        const body = await (error as { context?: Response }).context?.json?.().catch(() => null);
        throw new Error(body?.error ?? "Couldn't reset the password. Please try again.");
      }
      const login: StudentLogin = { name: student.name, username: data.username, password: data.password };
      if (isSchool) {
        login.pictures = generatePicturePassword();
        await savePicturePassword(student.id, login.pictures);
        const classId = (children.find((c) => c.id === student.id) as { class_id?: string } | undefined)?.class_id;
        login.classCode = classes.find((c) => c.id === classId)?.login_code;
      }
      return login;
    },
    onSuccess: (login) => {
      setResetStudent(null);
      setNewLogins([login]);
    },
    onError: (e: Error) => {
      setResetStudent(null);
      toast.error(e.message);
    },
  });

  // Login cards for a whole class. Students added before picture logins existed get pictures now.
  const classCardsMutation = useMutation({
    mutationFn: async (cls: { id: string; login_code?: string }) => {
      const students = children.filter((c) => (c as { class_id?: string }).class_id === cls.id);
      if (students.length === 0) throw new Error("There are no students in this class yet.");

      const { data: existing, error } = await (supabase as any)
        .from("student_picture_passwords")
        .select("child_id, pictures")
        .in("child_id", students.map((s) => s.id));
      if (error) throw error;
      const picturesById = new Map<string, string>(
        (existing as { child_id: string; pictures: string }[]).map((r) => [r.child_id, r.pictures]),
      );

      const logins: StudentLogin[] = [];
      for (const s of students) {
        let pictures = picturesById.get(s.id);
        if (!pictures) {
          pictures = generatePicturePassword();
          await savePicturePassword(s.id, pictures);
        }
        logins.push({ name: s.name, username: "", pictures, classCode: cls.login_code });
      }
      return logins;
    },
    onSuccess: (logins) => setNewLogins(logins),
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (isSchool && !studentClassId) {
      toast.error("Please select a class before uploading CSV");
      return;
    }
    const text = await file.text();
    const lines = text.trim().split("\n").slice(1);
    const students = lines
      .map((line) => {
        const parts = line.split(",");
        const first = parts[0]?.trim() || "";
        const last = parts[1]?.trim() || "";
        const g = grade || "3";
        const username = generateUsername(first, last, g);
        const age = GRADE_TO_AGE[g] ?? 8;
        return { name: `${first} ${last}`, username, age, password: generateKidPassword(), pictures: generatePicturePassword() };
      })
      .filter((s) => s.username && s.name.trim());

    const { data: sess } = await supabase.auth.getSession();
    const teacherAccessToken = sess.session?.access_token;
    const teacherRefreshToken = sess.session?.refresh_token;
    const teacherId = user.id;

    if (!teacherAccessToken || !teacherRefreshToken) {
      toast.error("Session error — please log out and back in");
      return;
    }

    let created = 0;
    const createdLogins: StudentLogin[] = [];
    for (const student of students) {
      toast.info(`Creating ${student.name}... (${created + 1}/${students.length})`);
      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${student.username}@cyberhero.app`,
          password: student.password,
        });
        await supabase.auth.setSession({ access_token: teacherAccessToken, refresh_token: teacherRefreshToken });
        if (signUpError) {
          toast.error(`Failed: ${student.name}`);
          continue;
        }
        const kidId = signUpData?.user?.id;
        if (kidId) {
          await supabase
            .from("profiles")
            .upsert({
              id: kidId,
              user_id: kidId,
              role: "kid",
              account_type: "kid",
              display_name: student.name,
              email: `${student.username}@cyberhero.app`,
            });
          await supabase.from("child_profiles").insert({
            id: kidId,
            parent_id: teacherId,
            name: student.name,
            age: student.age,
            learning_mode: "standard",
            avatar: "🦸",
            level: 1,
            points: 0,
            streak: 0,
            ...(studentClassId ? { class_id: studentClassId } : {}),
          });
          await supabase.from("parent_kid_links").insert({ parent_id: teacherId, kid_id: kidId });
          await savePicturePassword(kidId, student.pictures);
          created++;
          createdLogins.push({
            name: student.name,
            username: student.username,
            password: student.password,
            pictures: student.pictures,
            classCode: classes.find((c) => c.id === studentClassId)?.login_code,
          });
        }
      } catch {
        await supabase.auth.setSession({ access_token: teacherAccessToken, refresh_token: teacherRefreshToken });
        toast.error(`Failed: ${student.name}`);
      }
    }
    queryClient.invalidateQueries({ queryKey: ["children"] });
    toast.success(`✅ ${created}/${students.length} students imported!`);
    if (createdLogins.length > 0) setNewLogins(createdLogins);
    (e.target as HTMLInputElement).value = "";
  };

  const canSubmit = isSchool ? !!firstName && !!lastName && !!grade : !!form.name && !!form.username && !!form.password;
  const activeClass = classes.find((c) => c.id === selectedClassId);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{terms.kidsLabel}</h1>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setFirstName("");
            setLastName("");
            setGrade("");
            setStudentClassId("");
            setStudentPassword(generateKidPassword());
            setDrawerOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" /> {terms.addKidShort}
        </Button>
      </div>

      {/* Class Tabs (teacher only) */}
      {isSchool && (
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedClassId("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${selectedClassId === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              All Students ({children.length})
            </button>
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${selectedClassId === cls.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {cls.name} ({children.filter((c) => (c as any).class_id === cls.id).length})
              </button>
            ))}
            <button
              onClick={() => setNewClassDialogOpen(true)}
              className="rounded-full px-4 py-1.5 text-sm font-semibold border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all"
            >
              + New Class
            </button>
          </div>
          {activeClass && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                📚 {activeClass.name} · Grade {activeClass.grade} · {filteredChildren.length} students
              </p>
              {activeClass.login_code && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(activeClass.login_code!)
                      .then(() => toast.success("Class code copied!"))
                      .catch(() => toast.error("Couldn't copy. Select the code and copy it instead."));
                  }}
                  className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1 text-sm hover:bg-primary/10"
                  title="Copy class code"
                >
                  <span className="text-muted-foreground">Class code:</span>
                  <span className="font-mono text-base font-bold tracking-widest text-foreground">{activeClass.login_code}</span>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={classCardsMutation.isPending || !activeClass.login_code}
                onClick={() => classCardsMutation.mutate(activeClass)}
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                {classCardsMutation.isPending ? "Preparing…" : "Class Login Cards"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <motion.div className="grid grid-cols-3 gap-4 mb-8" variants={container} initial="hidden" animate="show">
        {[
          { label: terms.kidPlural, value: filteredChildren.length, icon: Users, color: "text-primary" },
          { label: "Missions Completed", value: totalMissionsDone, icon: CheckCircle2, color: "text-secondary" },
          { label: "Badges Earned", value: totalBadgesEarned, icon: Award, color: "text-accent" },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-7 w-10" /> : s.value}
            </p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed border-border bg-card">
          <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground">No {terms.kidPlural.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-muted-foreground mb-4">
            Add your first {terms.kidSingular.toLowerCase()} to start tracking their learning!
          </p>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> {terms.addKid}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> {isSchool ? "Students" : "Children"}
            </h2>
            <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
              {filteredChildren.map((child) => {
                const childBadges = getChildBadges(child.id);
                const summary = getChildSummary(child.id);
                const childClass = classes.find((c) => c.id === (child as any).class_id);
                return (
                  <motion.div
                    key={child.id}
                    variants={fadeUp}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
                    onClick={() => navigate(`/dashboard/kids/${child.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <HeroAvatar
                        avatarConfig={(child as any).avatar_config as Record<string, any> | null}
                        size={52}
                        fallbackEmoji={child.avatar}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-foreground">{child.name}</h3>
                          <Badge variant="secondary" className="border-0 text-xs">
                            Level {child.level}
                          </Badge>
                          {isSchool && classes.length > 0 ? (
                            <select
                              aria-label={`Class for ${child.name}`}
                              value={childClass?.id ?? ""}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                moveToClassMutation.mutate({ childId: child.id, classId: e.target.value || null })
                              }
                              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                childClass
                                  ? "border-primary/30 bg-primary/5 text-primary"
                                  : "border-dashed border-amber-400 bg-amber-50 text-amber-700"
                              }`}
                            >
                              <option value="">No class</option>
                              {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                  {cls.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            childClass && (
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                {childClass.name}
                              </Badge>
                            )
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>⭐ {child.points} pts</span>
                          <span>🏅 {childBadges.length} badges</span>
                          <span>🔥 {child.streak} streak</span>
                        </div>
                      </div>
                      <div
                        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Reset password"
                          aria-label={`Reset ${child.name}'s password`}
                          onClick={() => setResetStudent({ id: child.id, name: child.name })}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-8 w-8 p-0"
                          onClick={() => setDeleteId(child.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-xl bg-primary/5 p-2 text-center">
                        <div className="text-lg font-bold text-primary">{summary.completedCount}</div>
                        <div className="text-[10px] text-muted-foreground">Missions</div>
                      </div>
                      <div className="rounded-xl bg-accent/5 p-2 text-center">
                        <div className="text-lg font-bold text-accent">{summary.totalStars} ⭐</div>
                        <div className="text-[10px] text-muted-foreground">Stars</div>
                      </div>
                      <div className="rounded-xl bg-secondary/10 p-2 text-center">
                        <div className="truncate text-xs font-semibold text-secondary">{summary.strongestTopic}</div>
                        <div className="text-[10px] text-muted-foreground">Strongest</div>
                      </div>
                      <div className="rounded-xl bg-destructive/5 p-2 text-center">
                        <div className="truncate text-xs font-semibold text-destructive">
                          {summary.needsReviewTopic}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Needs Review</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {isSchool && leaderboard.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />{" "}
                {activeClass ? `${activeClass.name} Leaderboard` : "Class Leaderboard"}
              </h2>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="space-y-3">
                  {leaderboard.map((student, i) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <HeroAvatar
                        avatarConfig={(student as any).avatar_config as Record<string, any> | null}
                        size={32}
                        fallbackEmoji={student.avatar}
                      />
                      <span className="flex-1 font-semibold text-sm text-foreground">{student.name}</span>
                      <span className="text-sm font-bold text-primary">⭐ {student.points} pts</span>
                      <span className="text-xs text-muted-foreground">{student.completedCount} missions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" /> Mission Completion
            </h2>
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {MISSIONS.map((m) => {
                const Icon = m.icon;
                const completedCount = filteredProgress.filter(
                  (p) => p.mission_id === m.id && p.status === "completed",
                ).length;
                return (
                  <motion.div
                    key={m.id}
                    variants={fadeUp}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${m.color}`} />
                      <span className="text-sm font-bold text-foreground">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={filteredChildren.length > 0 ? (completedCount / filteredChildren.length) * 100 : 0}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completedCount}/{filteredChildren.length}
                      </span>
                    </div>
                    {isSchool && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {filteredChildren.map((c) => {
                          const p = filteredProgress.find((pr) => pr.child_id === c.id && pr.mission_id === m.id);
                          const done = p?.status === "completed";
                          return (
                            <span
                              key={c.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${done ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}
                            >
                              {c.name.split(" ")[0]}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {areasNeedingReview.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" /> Needing Review
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {areasNeedingReview.map((area) => (
                  <div key={area.missionTitle} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{area.missionTitle}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${area.status === "not started" ? "border-accent text-accent" : "border-primary text-primary"}`}
                      >
                        {area.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{area.childNames.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-primary">
              <MessageCircle className="h-4 w-4" /> {isSchool ? "Discussion Prompt" : "Conversation Starter"}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">{conversationStarter}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              {isSchool ? "Class Average Progress" : "Certificate Progress"}
            </h3>
            {isSchool ? (
              <>
                <div className="flex items-center gap-3">
                  <Progress value={classAverage} className="h-3 flex-1" />
                  <span className="text-sm font-semibold text-primary">{classAverage}%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Average completion across {filteredChildren.length} students and {MISSIONS.length} missions.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Progress value={certProgress.percent} className="h-3 flex-1" />
                  <span className="text-sm font-semibold text-primary">{certProgress.percent}%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {certProgress.earned}/{certProgress.total} badges earned across all children.
                  {certProgress.percent < 100
                    ? ` ${certProgress.total - certProgress.earned} more to unlock the CyberGuardian Certificate!`
                    : " 🎉 Certificate unlocked!"}
                </p>
              </>
            )}
          </div>

          {recentBadges.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" /> Recent Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentBadges.map((b) => {
                  const childName = filteredChildren.find((c) => c.id === b.child_id)?.name || "";
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm"
                    >
                      <span className="text-lg">{b.badge_icon}</span>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{b.badge_name}</div>
                        <div className="text-[10px] text-muted-foreground">{childName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <h3 className="mb-2 font-bold text-accent flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> {isSchool ? "Teaching Tips" : "Tips for Parents"}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              {(isSchool ? teacherTips : parentTips).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* New Class Dialog */}
      <Dialog open={newClassDialogOpen} onOpenChange={setNewClassDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Class Name *</Label>
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Period 1 - Grade 3"
              />
            </div>
            <div>
              <Label>Grade *</Label>
              <select
                value={newClassGrade}
                onChange={(e) => setNewClassGrade(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select grade</option>
                <option value="K">Kindergarten</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8+</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewClassDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createClassMutation.mutate()}
              disabled={!newClassName || !newClassGrade || createClassMutation.isPending}
            >
              {createClassMutation.isPending ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Student Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{terms.addKid}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            {isSchool ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Emma" />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Johnson" />
                  </div>
                </div>
                <div>
                  <Label>Grade *</Label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select grade</option>
                    <option value="K">Kindergarten</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8+</option>
                  </select>
                </div>
                <div>
                  <Label>Assign to Class</Label>
                  <select
                    value={studentClassId}
                    onChange={(e) => setStudentClassId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">No class (unassigned)</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                {firstName && lastName && grade && (
                  <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
                    <p className="text-xs font-bold text-foreground">🔑 Auto-generated login:</p>
                    <p className="text-xs text-muted-foreground">
                      Username: <span className="font-mono font-bold text-foreground">{autoUsername}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Password: <span className="font-mono font-bold text-foreground">{autoPassword}</span>
                    </p>
                  </div>
                )}
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Bulk Roster Import</p>
                  <p className="text-xs text-muted-foreground mb-1">CSV format: first_name, last_name</p>
                  {classes.length > 0 && (
                    <div className="mb-3">
                      <select
                        value={studentClassId}
                        onChange={(e) => setStudentClassId(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select class for CSV import</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={handleCSVUpload} />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("csv-upload")?.click()}>
                    Upload CSV
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const suggested = name.trim().toLowerCase().replace(/\s+/g, "") + (form.age || "");
                      setForm({ ...form, name, username: suggested });
                    }}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="e.g. 8"
                  />
                </div>
                <div>
                  <Label>Username *</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                    placeholder="e.g. jake8"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This is what {form.name || "your child"} types to log in
                  </p>
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 characters"
                  />
                </div>
              </>
            )}
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={!canSubmit || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : terms.addKid}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this {terms.kidSingular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete their account and all activity data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!resetStudent} onOpenChange={(open) => !open && setResetStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset {resetStudent?.name}'s password?</AlertDialogTitle>
            <AlertDialogDescription>
              They'll get a new password and their old one will stop working. Their progress and badges stay the same.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetPasswordMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={resetPasswordMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (resetStudent) resetPasswordMutation.mutate(resetStudent);
              }}
            >
              {resetPasswordMutation.isPending ? "Resetting…" : "Reset Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student logins: new, reset, or a class's picture logins */}
      <Dialog open={!!newLogins} onOpenChange={(open) => !open && setNewLogins(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>🔑 Save these logins now</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {newLogins?.some((l) => l.password)
              ? "Passwords can't be shown again after you close this. Print login cards or download the list to hand out."
              : "Print login cards or download the list to hand out. You can print these again any time."}
          </p>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  {newLogins?.some((l) => l.pictures) && <th className="px-3 py-2">Secret pictures</th>}
                  {newLogins?.some((l) => l.password) && (
                    <>
                      <th className="px-3 py-2">Username</th>
                      <th className="px-3 py-2">Password</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {newLogins?.map((l) => (
                  <tr key={`${l.name}-${l.username}`} className="border-t border-border">
                    <td className="px-3 py-2">{l.name}</td>
                    {newLogins.some((x) => x.pictures) && (
                      <td className="px-3 py-2 text-xl" title={l.pictures ? picturesToLabel(l.pictures) : ""}>
                        {l.pictures ? picturesToEmoji(l.pictures) : "—"}
                      </td>
                    )}
                    {newLogins.some((x) => x.password) && (
                      <>
                        <td className="px-3 py-2 font-mono font-bold">{l.username}</td>
                        <td className="px-3 py-2 font-mono font-bold">{l.password}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => newLogins && downloadLoginsCsv(newLogins)}>
              Download CSV
            </Button>
            <Button variant="outline" onClick={() => newLogins && printLoginCards(newLogins)}>
              Print Login Cards
            </Button>
            <Button onClick={() => setNewLogins(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
