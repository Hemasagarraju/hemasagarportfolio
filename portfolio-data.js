/**
 * ====================================================================
 * PORTFOLIO CONFIGURATION DATA - EXACT ITSVG.IN MODEL
 * ====================================================================
 * 
 * Modeled exactly after  (hema sagar raju).
 * You can customize your name, hero letters, project names,
 * Visa experience cards, and social links here!
 */

const portfolioData = {
  // Personal Information
  personal: {
    name: "HEMASAGAR RAJU",
    fullName: "Hemasagar Raju Chamarthi",
    logoHello: "Hello",
    role: "Front-end focused Software Developer,",
    specialization: "specialized in building scalable, user-centric web apps that prioritizes",
    avatar: "https://github.com/Hemasagarraju.png",
    heroLetters: [
      { char: "H", color: "hover:text-blue-600" },
      { char: "E", color: "hover:text-green-600" },
      { char: "M", color: "hover:text-red-600" },
      { char: "A", color: "hover:text-fuchsia-600" },
      { char: "S", color: "hover:text-emerald-600" },
      { char: "A", color: "hover:text-pink-600" },
      { char: "G", color: "hover:text-yellow-600" },
      { char: "A", color: "hover:text-indigo-600" },
      { char: "R", color: "hover:text-cyan-600" }
    ],
    stickerPriorities: [
      { text: "trends", bg: "from-lime-100 to-lime-200 text-lime-700 ring-lime-700", rotate: "-6deg", icon: "flame" },
      { text: "UI / UX", bg: "from-pink-100 to-pink-200 text-pink-700 ring-pink-700", rotate: "6deg", icon: "sparkles" },
      { text: "accessibility", bg: "from-yellow-100 to-yellow-200 text-yellow-700 ring-yellow-700", rotate: "-9deg", icon: "eye" },
      { text: "performance", bg: "from-fuchsia-100 to-fuchsia-200 text-fuchsia-700 ring-fuchsia-700", rotate: "15deg", icon: "gauge" }
    ],
    location: "Tirupati, Andhra Pradesh, India",
    email: "hemasagarraju94@gmail.com",
    socials: {
      twitter: "https://x.com/C_hemasagar_raju",
      github: "https://github.com/Hemasagarraju",
      linkedin: "https://linkedin.com/in/chamarthi-hemasagar-raju",
      instagram: "https://instagram.com/C._hemasagar_raju_"
    },
    repo: "https://github.com/Hemasagarraju/hemasagar-portfolio"
  },

  // Owner Access Protection (Only Hemasagar can add/edit/delete projects & achievements)
  admin: {
    pin: "2026"
  },

  // Global Impact Stats
  impact: {
    heading: "Our projects  are used and loved by people from all around the world",
    stats: [
      { value: "1H+", label: "Happy Users Worldwide" },
      { value: "1200+", label: "Country's people" },
      { value: "4+", label: "Projects Launched" }
    ]
  },

  // Terminal commands / output & letter scanner options
  terminal: {
    lastLogin: "wed oct 4 12:00:49 on console",
    theme: "emerald",
    scanActive: true,
    matrixActive: true,
    commands: [
      { cmd: "whoami", res: "hemasagar — frontend engineer & AI/ML developer" },
      { cmd: "cat current_stack.txt", res: "• Python • Machine Learning • HTML& CSS • AI" },
      { cmd: "status", res: "Open to work • Building new projects" }
    ]
  },

  // Projects Suite (All previous sample projects removed. Ready for your projects!)
  // Whenever you are ready to add a project, just paste it into this array:
  //
  // Example format:
  // {
  //   id: "my-project",
  //   title: "Project Title",
  //   domain: "myproject.vercel.app",
  //   url: "https://myproject.vercel.app",
  //   github: "https://github.com/Hemasagarraju/my-project",
  //   logo: "https://via.placeholder.com/120",
  //   description: "A short description of what your project does.",
  //   tags: ["React", "Tailwind CSS", "Python"],
  //   users: "Active Project"
  // },
  projects: [],

  // Bento Features Grid
  features: [
    {
      title: "Latest Tech",
      desc: "Stay ahead with cutting-edge frameworks and libraries for a modern web experience.",
      icon: "code"
    },
    {
      title: "Responsiveness",
      desc: "Seamless adaptation across devices for a flawless user experience everywhere.",
      icon: "smartphone"
    },
    {
      title: "Performance",
      desc: "Optimized for speed and efficiency, delivering lightning-fast experiences.",
      icon: "zap"
    },
    {
      title: "Beautiful UI",
      desc: "Aesthetic designs that blend style with usability for a polished interface.",
      icon: "palette"
    },
    {
      title: "Beautiful UX",
      desc: "Crafting intuitive and enjoyable interactions that keep users engaged.",
      icon: "heart"
    }
  ],

  // The Signature VISA Credit Cards Experience Stack (Fresher & SDE editions)
  visaCards: [
  {
    "id": "exp-1",
    "education": "B.Tech",
    "Branch": "AI/ML",
    "tenure": "2025-2029",
    "bgGradient": "linear-gradient(135deg, #0998b4ff 0%, #dfbfacff 100%)",
    "number": "•••• •••• •••• 4421"
  },
  {
    "id": "exp-2",
    "university": "Annamacharya institute of technology and sciences",
    "location": "Tirupati,andhrapradesh",
    "status": "Student",
    "bgGradient": "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
    "number": "•••• •••• •••• 4421"
  },
  {
    "id": "exp-3",
    "role": "FREELANCE & OSS",
    "company": "Hemasagar Dev",
    "tenure": "Present",
    "bgGradient": "linear-gradient(135deg, #6d28d9 0%, #312e81 100%)",
    "number": "•••• •••• •••• 7789"
  },
  {
    "id": "exp-4",
    "role": "Open to work",
    "present": "intenships",
    "tenure": "Fresher",
    "bgGradient": "linear-gradient(135deg, #a51569ff 0%, #78350f 100%)",
    "number": "•••• •••• •••• 4421"
  }
],

  // Signature Achievements & Honors Stack (Customizable in website or data file)
  achievements: [
    {
      id: "ach-1",
      title: "AI/ML Academic Scholar",
      issuer: "AITS Tirupati",
      date: "2025",
      badgeType: "HONOR",
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
      number: "•••• •••• •••• 8812",
      description: "Recognized for high academic performance and foundational AI/ML research work.",
      credentialUrl: ""
    },
    {
      id: "ach-2",
      title: "Frontend Engineering Specialist",
      issuer: "Open Source Creator",
      date: "2025",
      badgeType: "GOLD",
      bgGradient: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)",
      number: "•••• •••• •••• 9924",
      description: "Built and deployed high-performance responsive web applications with interactive neo-brutalist UI/UX.",
      credentialUrl: ""
    }
  ],

  // Testimonials
  testimonials: [
    {
      quote: "I stumbled upon ColPat tool when I was struggling with color choices for my website. It's like having a personal AI designer! The interface is intuitive, and the color suggestions are spot-on. Definitely my go-to tool for color palettes now!",
      author: "Alex Chen",
      rating: 5
    },
    {
      quote: "Hardships often prepare ordinary people for an extraordinary destiny.",
      author: "C.S.Lewis",
      rating: 5
    },
    {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      rating: 5
    },
    {
      quote: "Dream big and dare to fail.",
      author: "Norman Vaughan",
      rating: 5
    },
    {
      quote: "It's always seems impossible until it's done.",
      author: "Nelson Mandela",
      rating: 5
    }
  ],
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = portfolioData;
}
if (typeof window !== "undefined") {
  window.portfolioData = portfolioData;
}
