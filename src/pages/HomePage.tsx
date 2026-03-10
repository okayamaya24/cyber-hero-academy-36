import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Star, Gamepad2, Users, Award, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import heroKidsGroup from "@/assets/hero-kids-group.png";
import heroCharacter from "@/assets/hero-character.png";
import robotGuide from "@/assets/robot-guide.png";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect logged-in users to the appropriate dashboard
      if (user && localStorage.getItem("cyber_hero_active_child")) {
        navigate("/dashboard");
      } else {
        navigate("/parents");
      }
    }
  }, [user, navigate]);

  if (user) {
    // Don't render the public homepage if the user is logged in (handled by useEffect redirect)
    return null;
  }

  return (
    <div className="container grid items-center justify-center gap-6 pt-20 md:pt-10">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Unlock Your Child's Cyber Potential
            </h1>
            <p className="scroll-m-20 leading-7 text-muted-foreground">
              Empower kids with essential digital skills through fun,
              interactive learning.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/signup">
              <Button size="lg">
                Get Started <Shield className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Log In
              </Button>
            </Link>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <img
            src={heroKidsGroup}
            alt="Kids Learning"
            className="mx-auto max-w-md rounded-lg object-cover"
          />
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
          <Shield className="h-10 w-10 text-primary" />
          <h2 className="text-2xl font-semibold">Cyber Safety</h2>
          <p className="text-center text-muted-foreground">
            Learn to navigate the digital world safely.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
          <Star className="h-10 w-10 text-primary" />
          <h2 className="text-2xl font-semibold">Fun Challenges</h2>
          <p className="text-center text-muted-foreground">
            Engaging missions that make learning enjoyable.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
          <Gamepad2 className="h-10 w-10 text-primary" />
          <h2 className="text-2xl font-semibold">Interactive Games</h2>
          <p className="text-center text-muted-foreground">
            Develop skills through exciting gameplay.
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
              Why Choose Cyber Hero Academy?
            </h2>
            <p className="scroll-m-20 leading-7 text-muted-foreground">
              We make learning about cyber safety fun and effective for kids of
              all ages.
            </p>
          </div>
          <ul className="grid gap-2.5">
            <li className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Engaging Content</span>
            </li>
            <li className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Expert-Designed Curriculum</span>
            </li>
            <li className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Parent-Friendly Tools</span>
            </li>
          </ul>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <img
            src={heroCharacter}
            alt="Hero Character"
            className="mx-auto max-w-md rounded-lg object-cover"
          />
        </motion.div>
      </section>

      <section className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
          <img
            src={robotGuide}
            alt="Robot Guide"
            className="h-20 w-20 object-contain"
          />
          <h3 className="text-xl font-semibold">Interactive Lessons</h3>
          <p className="text-center text-muted-foreground">
            Learn with our friendly robot guide.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
          <img
            src={detectiveCat}
            alt="Detective Cat"
            className="h-20 w-20 object-contain"
          />
          <h3 className="text-xl font-semibold">Fun Missions</h3>
          <p className="text-center text-muted-foreground">
            Solve cyber mysteries with Detective Cat.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border p-4">
          <img
            src={wiseOwl}
            alt="Wise Owl"
            className="h-20 w-20 object-contain"
          />
          <h3 className="text-xl font-semibold">Expert Tips</h3>
          <p className="text-center text-muted-foreground">
            Get advice from the Wise Owl on staying safe online.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
