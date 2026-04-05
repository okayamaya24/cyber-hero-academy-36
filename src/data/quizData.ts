export type AgeTier = 'junior' | 'hero' | 'elite';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const QUIZ_DATA: Record<string, Record<AgeTier, QuizQuestion[]>> = {
  'spot-the-scam': {
    junior: [
      { question: 'Someone emails you saying you won a FREE iPad! What do you do?', options: ['Click the link!', 'Ignore it — its a trick!'], correct: 1, explanation: 'Surprise prize emails are almost always scams!' },
      { question: 'A pop-up says your computer has a virus and to call a number. What do you do?', options: ['Call the number', 'Close the pop-up and tell an adult'], correct: 1, explanation: 'Fake virus warnings are a common scam trick!' },
      { question: 'Someone online says they need your home address to send you a gift. You should...', options: ['Give it to them!', 'Never give your address to strangers!'], correct: 1, explanation: 'Never share your address with anyone online!' },
      { question: 'An email says you MUST reply in 1 hour or lose your account. This is...', options: ['Urgent — reply fast!', 'A scam using pressure tactics'], correct: 1, explanation: 'Scammers use fake urgency to make you panic!' },
      { question: 'Which of these is probably real?', options: ['YOU WON $1,000,000!!!', 'Your library book is due tomorrow'], correct: 1, explanation: 'Real messages are calm and specific. Scams use ALL CAPS!' },
    ],
    hero: [
      { question: 'An email says your bank account is suspended. The link goes to "bank-secure-login.com". What is wrong?', options: ['Nothing, it looks fine', 'The domain is fake — real banks use their own domain', 'The email is too short', 'Banks never email'], correct: 1, explanation: 'Your real bank would link to bankname.com, not a random domain!' },
      { question: 'Which email sender is most suspicious?', options: ['support@paypal.com', 'noreply@paypa1-secure.net', 'service@amazon.com', 'help@apple.com'], correct: 1, explanation: '"paypa1" uses a number 1 instead of the letter l — classic phishing trick!' },
      { question: 'A scam email creates panic by saying your account will be deleted in 24 hours. This tactic is called...', options: ['Spear phishing', 'Urgency manipulation', 'Spoofing', 'Baiting'], correct: 1, explanation: 'Creating urgency stops you from thinking carefully!' },
      { question: 'You receive a prize notification email. Which detail makes it definitely a scam?', options: ['It mentions your name', 'It asks for your credit card to "cover shipping"', 'It comes from a company', 'It has a logo'], correct: 1, explanation: 'Legitimate prizes never need your credit card info to deliver!' },
      { question: 'What is "vishing"?', options: ['Video phishing', 'Voice phishing — scams over phone calls', 'Phishing via text message', 'Hacking visual systems'], correct: 1, explanation: 'Vishing = voice phishing. Scammers call pretending to be banks or tech support!' },
    ],
    elite: [
      { question: 'A spear phishing email references your real boss by name. How did the attacker get this info?', options: ['They guessed', 'OSINT from LinkedIn and company website', 'They hacked your phone', 'Random generation'], correct: 1, explanation: 'Spear phishing uses OSINT to personalize attacks.' },
      { question: 'Which is a Business Email Compromise (BEC) attack indicator?', options: ['Email from CEO asking you to buy gift cards urgently', 'An email with a typo', 'An email with no signature', 'An email sent at night'], correct: 0, explanation: 'BEC attacks impersonate executives — gift card requests are a classic BEC tactic.' },
      { question: 'A phishing email passes SPF and DKIM checks. What does this indicate?', options: ['The email is safe', 'The attacker may have compromised a legitimate sending server', 'The checks are broken', 'It is definitely from the real company'], correct: 1, explanation: 'Passing SPF/DKIM means the sending server is authorized — attackers can abuse legitimate services.' },
      { question: 'What makes homograph attacks particularly dangerous?', options: ['They use HTML tricks', 'Domain names use look-alike Unicode characters invisible to users', 'They bypass all firewalls', 'They use JavaScript'], correct: 1, explanation: 'Homograph attacks use Unicode characters that look identical to ASCII.' },
      { question: 'Whaling attacks target which specific group?', options: ['All employees', 'IT administrators only', 'Senior executives and C-suite', 'New employees'], correct: 2, explanation: 'Whaling = whale-sized targets. Highly personalized attacks on executives with financial authority.' },
    ],
  },
  'password-power': {
    junior: [
      { question: 'Which password is the strongest?', options: ['password', '123456', 'M!c3y#82!', 'myname'], correct: 2, explanation: 'Strong passwords mix uppercase, lowercase, numbers, and symbols!' },
      { question: 'Should you use the same password for every account?', options: ['Yes, its easier!', 'No — if one is hacked, all are hacked!'], correct: 1, explanation: 'Different accounts need different passwords!' },
      { question: 'A good password should be...', options: ['Short and easy', 'Long with letters, numbers and symbols'], correct: 1, explanation: 'Longer mixed-character passwords are much harder to crack!' },
      { question: 'You should share your password with...', options: ['Your best friend', 'Nobody — not even friends!'], correct: 1, explanation: 'Your password is for YOU only. Never share it!' },
      { question: 'Which is a bad password idea?', options: ['Using your pet\'s name', 'Using random words + numbers + symbols'], correct: 0, explanation: 'Personal info like pet names is easy for hackers to guess!' },
    ],
    hero: [
      { question: 'What is a password manager used for?', options: ['Changing passwords automatically', 'Securely storing and generating strong passwords', 'Sharing passwords safely', 'Resetting forgotten passwords'], correct: 1, explanation: 'Password managers store all your passwords encrypted!' },
      { question: 'How long should a strong password be?', options: ['6+ characters', '8+ characters', '12+ characters', '4+ characters'], correct: 2, explanation: 'At least 12 characters. Longer = exponentially harder to crack!' },
      { question: 'What is a passphrase?', options: ['A hint for your password', 'A long password made of random words', 'Your security question answer', 'A backup password'], correct: 1, explanation: '"CoffeeMoonRocketJazz!" — long, random, memorable, very secure!' },
      { question: 'What does a brute force attack do?', options: ['Tricks you into revealing your password', 'Tries every possible character combination', 'Steals password files', 'Guesses common passwords'], correct: 1, explanation: 'Longer passwords make brute force take millions of years!' },
      { question: 'Which makes two equal-length passwords different in security?', options: ['Using only letters', 'Using letters, numbers, and symbols', 'Using your birthday', 'Making it easy to type'], correct: 1, explanation: 'Adding symbols expands the character set exponentially!' },
    ],
    elite: [
      { question: 'What is credential stuffing?', options: ['Filling login forms with random data', 'Using leaked username/password pairs to attack other sites', 'Brute forcing email credentials', 'Stuffing malware into login pages'], correct: 1, explanation: 'Attackers take credentials from one breach and try them elsewhere — password reuse is the vulnerability.' },
      { question: 'bcrypt is preferred over MD5 for password hashing because...', options: ['It is faster', 'It has a configurable cost factor making it intentionally slow', 'It is shorter', 'It is more widely supported'], correct: 1, explanation: 'bcrypt\'s work factor can be increased as hardware gets faster.' },
      { question: 'What is a rainbow table attack?', options: ['Generating random passwords', 'Using precomputed hash-to-password lookups', 'Attacking encrypted databases', 'Social engineering to reveal passwords'], correct: 1, explanation: 'Rainbow tables are precomputed lookups — salting defeats this!' },
      { question: 'NIST SP 800-63B recommends against which common password policy?', options: ['Minimum 8 characters', 'Mandatory periodic password rotation', 'Checking against breached passwords', 'Allowing all ASCII characters'], correct: 1, explanation: 'Forced rotation causes weak patterns. NIST recommends changing only on breach evidence.' },
      { question: 'What is the purpose of password salting?', options: ['Encrypting the password', 'Adding random data before hashing to prevent precomputed attacks', 'Making passwords longer', 'Encoding passwords in base64'], correct: 1, explanation: 'A unique salt per user ensures identical passwords produce different hashes.' },
    ],
  },
  'safe-sites': {
    junior: [
      { question: 'A safe website address usually starts with...', options: ['http://', 'https://'], correct: 1, explanation: 'The "s" in https means the connection is secure!' },
      { question: 'A website asks for your home address to give you free stickers. You should...', options: ['Fill it in!', 'Ask a parent first'], correct: 1, explanation: 'Always check with a trusted adult before giving personal info online!' },
      { question: 'A website has lots of pop-ups. This is...', options: ['A fun website!', 'Probably unsafe — close it!'], correct: 1, explanation: 'Lots of pop-ups are warning signs of unsafe sites!' },
      { question: 'Which website seems safe?', options: ['amaz0n-deals.net', 'amazon.com'], correct: 1, explanation: 'Look carefully at the domain! Fake sites use misspellings.' },
      { question: 'The padlock icon in your browser means...', options: ['The site is totally safe', 'The connection is encrypted'], correct: 1, explanation: 'A padlock means data is encrypted — but always check the domain too!' },
    ],
    hero: [
      { question: 'What does HTTPS actually protect?', options: ['Whether the site is trustworthy', 'The data transmitted between you and the site', 'Your computer from viruses', 'Your identity online'], correct: 1, explanation: 'HTTPS encrypts data in transit — says nothing about whether the site is legitimate!' },
      { question: 'A website URL reads "paypal.com.verify-account.net". Where is the actual domain?', options: ['paypal.com', 'verify-account.net', 'com.verify-account.net', 'paypal.com.verify-account'], correct: 1, explanation: 'The real domain is just before the first slash — verify-account.net owns this URL!' },
      { question: 'What is typosquatting?', options: ['Exploiting typos in code', 'Registering misspelled domain names to trap users', 'Hacking through URL parameters', 'Squatting on expired domains'], correct: 1, explanation: 'Typosquatters register gogle.com waiting for people to make typos!' },
      { question: 'Certificate Transparency logs help with...', options: ['Encrypting website content', 'Detecting unauthorized SSL certificates', 'Blocking malicious websites', 'Identifying website owners'], correct: 1, explanation: 'CT logs create a public record of all issued certificates.' },
      { question: 'A website SSL certificate issued to "Paypal Inc." means...', options: ['The site is definitely legitimate', 'The certificate was issued to that entity — still verify the domain', 'The site passed all security checks', 'Your connection is fully secure'], correct: 1, explanation: 'Anyone can buy a cert for a company name — always verify the actual domain!' },
    ],
    elite: [
      { question: 'What is a subdomain takeover attack?', options: ['Hacking the main domain', 'Exploiting dangling DNS records pointing to unclaimed cloud resources', 'Taking over subdomains through brute force', 'Redirecting traffic via BGP hijacking'], correct: 1, explanation: 'When a subdomain DNS points to an unclaimed service, attackers claim it and serve content on the legitimate subdomain.' },
      { question: 'HTTP Strict Transport Security (HSTS) prevents...', options: ['SQL injection via HTTPS', 'Protocol downgrade attacks and cookie hijacking over HTTP', 'Certificate spoofing', 'DNS poisoning attacks'], correct: 1, explanation: 'HSTS tells browsers to always use HTTPS, preventing TLS stripping.' },
      { question: 'Content Security Policy (CSP) primarily mitigates...', options: ['CSRF attacks', 'Cross-Site Scripting (XSS) by controlling which resources load', 'SQL injection', 'Session fixation'], correct: 1, explanation: 'CSP whitelists allowed content sources, preventing injected scripts from executing.' },
      { question: 'A site uses window.location for redirects based on URL parameters. The vulnerability is...', options: ['CSRF', 'Clickjacking', 'Open redirect enabling phishing attacks', 'Path traversal'], correct: 2, explanation: 'Open redirects let attackers craft URLs like legit-site.com/redirect?url=evil.com.' },
      { question: 'SameSite=Strict cookie attribute protects against...', options: ['XSS via cookie theft', 'CSRF by preventing cross-site request cookie inclusion', 'Clickjacking', 'Session fixation'], correct: 1, explanation: 'SameSite=Strict prevents cookies being sent on cross-origin requests, eliminating CSRF.' },
    ],
  },
  'malware-monsters': {
    junior: [
      { question: 'A virus on your computer is like...', options: ['A helpful robot', 'A sickness that spreads and causes damage'], correct: 1, explanation: 'Computer viruses spread and damage your files!' },
      { question: 'How does malware usually get on your computer?', options: ['By itself magically', 'Clicking bad links or downloading unsafe files'], correct: 1, explanation: 'Always be careful what you click and download!' },
      { question: 'What is the best protection from malware?', options: ['Antivirus software and careful clicking', 'A strong password'], correct: 0, explanation: 'Antivirus + careful browsing prevents infections!' },
      { question: 'A "Trojan" is...', options: ['A type of antivirus', 'Malware hidden inside a normal-looking program'], correct: 1, explanation: 'Like the Trojan horse — it looks safe but hides something dangerous!' },
      { question: 'You should download apps from...', options: ['Any website that offers them free', 'Official app stores only'], correct: 1, explanation: 'Official stores check apps for malware!' },
    ],
    hero: [
      { question: 'What makes ransomware different from other malware?', options: ['It steals your identity', 'It encrypts your files and demands payment', 'It slows down your computer', 'It shows you ads'], correct: 1, explanation: 'Ransomware encrypts files and holds them hostage — backups are your best defense!' },
      { question: 'A worm differs from a virus because...', options: ['Worms are less dangerous', 'Worms self-replicate across networks without needing a host file', 'Worms only affect mobile', 'Worms require clicking'], correct: 1, explanation: 'Worms spread automatically — like WannaCry which infected 200,000 computers in one day!' },
      { question: 'What is a rootkit?', options: ['A malware removal tool', 'Malware that hides itself deep in the OS', 'A type of ransomware', 'A network tool'], correct: 1, explanation: 'Rootkits modify the OS to hide their presence — hardest malware to detect!' },
      { question: 'Drive-by download attacks happen when...', options: ['You download a file intentionally', 'Visiting a compromised website automatically downloads malware', 'You use a USB drive', 'Someone emails you malware'], correct: 1, explanation: 'No click needed — just visiting an infected site can trigger a download!' },
      { question: 'What is the purpose of a botnet?', options: ['To speed up your internet', 'A network of infected devices for coordinated attacks', 'To provide free computing', 'To back up data'], correct: 1, explanation: 'Botnets have millions of infected devices used for DDoS, spam, crypto mining!' },
    ],
    elite: [
      { question: 'A fileless malware attack is effective because...', options: ['It uses no code', 'It lives in memory using legitimate system tools, leaving no disk artifacts', 'Antivirus cannot run without files', 'It self-destructs'], correct: 1, explanation: 'Fileless malware uses LOLBins like PowerShell — making detection extremely difficult.' },
      { question: 'What is process hollowing?', options: ['Deleting running processes', 'Replacing a legitimate process memory with malicious code', 'Hiding processes from Task Manager', 'Spawning child processes'], correct: 1, explanation: 'Process hollowing creates a legitimate-looking process and injects malicious code — looks trusted to security tools.' },
      { question: 'A keylogger is classified as which malware type?', options: ['Ransomware', 'Spyware — credential theft', 'Adware', 'Worm'], correct: 1, explanation: 'Keyloggers are spyware that record keystrokes to steal passwords.' },
      { question: 'What distinguishes an APT from regular malware?', options: ['APTs use more advanced code', 'APTs are targeted, long-term intrusions often by nation-state actors', 'APTs are faster', 'APTs only attack governments'], correct: 1, explanation: 'Advanced Persistent Threats are stealthy targeted campaigns that remain undetected for months.' },
      { question: 'YARA rules are used for...', options: ['Blocking network traffic', 'Pattern-based malware detection and classification', 'Encrypting malware samples', 'Automating incident response'], correct: 1, explanation: 'YARA lets analysts write rules based on file patterns to identify malware families.' },
    ],
  },
  'smart-sharing': {
    junior: [
      { question: 'Which is SAFE to share online?', options: ['Your home address', 'Your favorite color'], correct: 1, explanation: 'Your favorite color is fine — your address is private!' },
      { question: 'A new online friend asks for your phone number. You should...', options: ['Give it to them!', 'Say no — tell a trusted adult'], correct: 1, explanation: 'Online friends you have never met should not get your phone number!' },
      { question: 'Before posting a photo online, think about...', options: ['How cool it looks', 'Who can see it and if it shows private info'], correct: 1, explanation: 'Photos can reveal your location or school. Think before you post!' },
      { question: 'Private information includes...', options: ['Your favorite movie', 'Your full name and where you live'], correct: 1, explanation: 'Full name, address, phone, and school are all private!' },
      { question: 'Once you post something online...', options: ['You can always delete it completely', 'It could stay there forever even if deleted'], correct: 1, explanation: 'Screenshots mean things can live online forever!' },
    ],
    hero: [
      { question: 'What is a digital footprint?', options: ['Your gaming username', 'The trail of data you leave online through every action', 'Your profile picture', 'Your download history'], correct: 1, explanation: 'Every search, post, and click builds your digital footprint!' },
      { question: 'Location data in photos is called...', options: ['GPS tags', 'EXIF metadata', 'GeoJSON', 'Photo coordinates'], correct: 1, explanation: 'EXIF metadata can contain exact GPS coordinates of where a photo was taken!' },
      { question: 'Oversharing your daily routine online creates a risk of...', options: ['Too many followers', 'Physical stalking and burglary', 'Account hacking', 'Identity confusion'], correct: 1, explanation: 'Posting "heading to school until 3!" tells strangers when your home is empty!' },
      { question: 'What does "privacy by default" mean?', options: ['Accounts start with maximum privacy settings', 'Privacy settings need manual setup', 'All data is private by law', 'Encryption is automatic'], correct: 0, explanation: 'Privacy by default means the most private settings are on unless you choose to share!' },
      { question: 'A friend shares a photo including you without asking. You have the right to...', options: ['Have them arrested', 'Request removal — you have image rights', 'Do nothing', 'Share their photos back'], correct: 1, explanation: 'In many places, you have rights over images of yourself!' },
    ],
    elite: [
      { question: 'Browser fingerprinting uniquely identifies users by...', options: ['Cookies', 'Combining browser settings, fonts, resolution into a unique profile', 'IP address alone', 'Login credentials'], correct: 1, explanation: 'Browser fingerprinting works even in incognito mode!' },
      { question: 'What is data minimization under GDPR?', options: ['Deleting all user data', 'Only collecting data necessary for the specified purpose', 'Minimizing breach damage', 'Encrypting sensitive fields'], correct: 1, explanation: 'GDPR requires organizations to collect only what they genuinely need.' },
      { question: 'Shadow profiles are created when...', options: ['You use a fake name', 'Platforms build profiles of non-users from contact data uploads', 'Your data is stolen', 'You delete your account'], correct: 1, explanation: 'When users upload contacts, platforms build profiles on non-users without their knowledge!' },
      { question: 'Third-party cookies primarily enable...', options: ['Faster page loading', 'Cross-site tracking of user behavior across the web', 'Saving login sessions', 'Site personalization'], correct: 1, explanation: 'Third-party cookies follow you across sites, building detailed behavioral profiles.' },
      { question: 'Contextual integrity in privacy states that...', options: ['Data should be encrypted in context', 'Information flows should match the norms of the context it was shared in', 'Personal data needs context tags', 'Privacy depends on user context'], correct: 1, explanation: 'Sharing medical info with your doctor is fine; sharing with an employer violates contextual integrity.' },
    ],
  },
};

export const BLITZ_QUESTIONS: Record<AgeTier, QuizQuestion[]> = {
  junior: [
    { question: 'Should you share your password with friends?', options: ['Yes!', 'Never!'], correct: 1, explanation: 'Passwords are secret — never share them!' },
    { question: 'A safe website starts with...', options: ['http://', 'https://'], correct: 1, explanation: 'The S means secure!' },
    { question: 'Which password is strongest?', options: ['password123', 'R@nd0m!X9#'], correct: 1, explanation: 'Mix letters, numbers, and symbols!' },
    { question: 'An email says you won $1 million. It is probably...', options: ['Real!', 'A scam!'], correct: 1, explanation: 'Random prize emails are scams!' },
    { question: 'Should you talk to strangers online?', options: ['Yes, its fine!', 'Be very careful!'], correct: 1, explanation: 'Online strangers might not be who they say!' },
    { question: 'Your home address is...', options: ['Safe to share', 'Private — keep it secret!'], correct: 1, explanation: 'Never share your home address online!' },
    { question: 'Logging out of shared computers is...', options: ['A waste of time', 'Very important!'], correct: 1, explanation: 'Always log out so nobody can access your account!' },
    { question: 'A virus on your computer...', options: ['Helps it run faster', 'Damages files and spreads'], correct: 1, explanation: 'Viruses are harmful programs!' },
    { question: 'You should download apps from...', options: ['Official stores only', 'Any website'], correct: 0, explanation: 'Official stores check apps for malware!' },
    { question: 'Once you post online, the content...', options: ['Can always be deleted', 'Might stay forever'], correct: 1, explanation: 'Screenshots mean things can live online forever!' },
  ],
  hero: [
    { question: 'Two-factor authentication adds security by...', options: ['Doubling your password', 'Requiring a second verification step'], correct: 1, explanation: 'Even if your password is stolen, 2FA stops attackers!' },
    { question: 'Phishing emails often include...', options: ['Correct grammar and slow urgency', 'Fake urgency and suspicious links'], correct: 1, explanation: 'Scammers create panic to stop you thinking carefully!' },
    { question: 'A strong password should be at least...', options: ['8 characters', '12 characters'], correct: 1, explanation: 'Longer passwords are exponentially harder to crack!' },
    { question: 'Public Wi-Fi is dangerous for...', options: ['Casual browsing', 'Banking and sensitive logins'], correct: 1, explanation: 'Public networks can be monitored by anyone nearby!' },
    { question: 'HTTPS means...', options: ['The site is 100% safe', 'The connection is encrypted'], correct: 1, explanation: 'Encrypted connection — but still check the domain!' },
    { question: 'Ransomware...', options: ['Speeds up your PC', 'Encrypts files and demands payment'], correct: 1, explanation: 'Ransomware holds your files hostage!' },
    { question: 'A password manager...', options: ['Changes passwords automatically', 'Securely stores all your passwords'], correct: 1, explanation: 'You only need to remember one master password!' },
    { question: 'Software updates should be installed...', options: ['When convenient', 'As soon as possible — they patch security holes'], correct: 1, explanation: 'Updates fix vulnerabilities hackers actively exploit!' },
    { question: 'Your digital footprint includes...', options: ['Only social media posts', 'Everything you do online'], correct: 1, explanation: 'Every online action leaves a trace!' },
    { question: 'Social engineering attacks target...', options: ['Computer vulnerabilities', 'Human psychology and trust'], correct: 1, explanation: 'Social engineering manipulates people, not code!' },
  ],
  elite: [
    { question: 'Zero-day vulnerabilities are dangerous because...', options: ['They are very common', 'No patch exists yet when discovered'], correct: 1, explanation: 'Zero-days have no fix — attackers exploit them before vendors know!' },
    { question: 'End-to-end encryption ensures...', options: ['Only server can read messages', 'Only sender and recipient can read messages'], correct: 1, explanation: 'E2E means not even the service provider can read your messages!' },
    { question: 'A DDoS attack primarily aims to...', options: ['Steal data', 'Make a service unavailable by overwhelming it'], correct: 1, explanation: 'DDoS floods servers with traffic until they collapse!' },
    { question: 'SIM swapping can bypass...', options: ['Password authentication', 'SMS-based two-factor authentication'], correct: 1, explanation: 'Attackers port your number to receive your SMS codes!' },
    { question: 'SQL injection exploits...', options: ['Weak passwords', 'Unsanitized database inputs'], correct: 1, explanation: 'Injecting SQL commands can expose entire databases!' },
    { question: 'VPNs do NOT protect against...', options: ['ISP traffic monitoring', 'Tracking via cookies and account logins'], correct: 1, explanation: 'VPNs mask your IP but cookies and logins still identify you!' },
    { question: 'Credential stuffing uses...', options: ['Brute force on one account', 'Leaked passwords tested across many different sites'], correct: 1, explanation: 'This is why password reuse is so dangerous!' },
    { question: 'GDPR right to erasure means...', options: ['Companies must delete all data instantly', 'Users can request deletion of their personal data'], correct: 1, explanation: '"Right to be forgotten" — companies must comply within 30 days!' },
    { question: 'A supply chain attack targets...', options: ['The primary target directly', 'A trusted vendor to reach the real target'], correct: 1, explanation: 'SolarWinds attack compromised 18,000 organizations via poisoned software update!' },
    { question: 'OSINT stands for...', options: ['Online Security Intelligence Threat', 'Open Source Intelligence — gathering info from public sources'], correct: 1, explanation: 'OSINT uses publicly available data to build attack profiles.' },
  ],
};
