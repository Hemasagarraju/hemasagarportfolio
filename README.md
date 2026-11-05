# ⚡ Hemasagar Raju Chamarthi — Portfolio

> A modern, high-performance developer portfolio built with **HTML5, Tailwind CSS, and Vanilla JavaScript (ES6+)**, featuring dynamic project creation & management, career credentials, honors & achievements, custom photo settings, interactive hacker terminal with up-to-bottom letter scan, and live in-browser customization.

🔗 **GitHub Repository**: [https://github.com/Hemasagarraju/hemasagar-portfolio.git](https://github.com/Hemasagarraju/hemasagar-portfolio.git)

---

## 🌟 Key Highlights

- **Aesthetic Neobrutalist Developer UI**: Modeled after `itsvg.in` with dark & light high-contrast styling, custom SVG marquee tech ribbons, floating navigation dock, and 3D card perspectives.
- **In-Browser Project Creator**: Add, edit, and delete projects directly on the website with live preview links, GitHub URLs, metrics, and tags.
- **Career Credentials & Achievements**: Interactive 3D cards for work experience, education, hackathons, and certifications with full in-website editing.
- **Interactive Terminal with Up-To-Bottom Letter Scan**: Features moving laser scanner beam, cascading matrix digital letters, typewriter character decoder, and interactive CLI (`scan`, `skills`, `whoami`, `matrix`, `help`).
- **Account & Profile Customizer**: Customize your profile photo via device upload or direct URL, with live site-wide preview and persistent backend sync.
- **Zero-Setup & Zero-Dependency**: Runs immediately with any browser or built-in Node.js server.

---

## 🚀 How to Run Locally

### Option 1: Direct File Launch (No installation required)
Simply double-click `index.html` or open it in any web browser.

### Option 2: Using the Built-in Node Server
```bash
npm start
# or
node server.js
```
Then visit [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📦 Git & GitHub Setup

Clone or push to this repository:
```bash
# Clone the repository
git clone https://github.com/Hemasagarraju/hemasagar-portfolio.git

# Or push your local changes:
git add .
git commit -m "feat: complete developer portfolio with terminal scanner, CRUD projects & achievements"
git branch -M main
git remote add origin https://github.com/Hemasagarraju/hemasagar-portfolio.git
git push -u origin main
```

---

## 🛠️ How to Customize

You can customize this portfolio in **two easy ways**:

### Method A: Using the Live In-Browser Customizer (Visual GUI)
1. Open the portfolio in your browser.
2. Click the **"⚙️ Customize"** button in the top navigation bar.
3. Update your **Name**, **Role**, **Headline**, **Email**, and **Location**.
4. In the **"Project Names & Details"** section:
   - Select any existing project from the dropdown to rename it or modify its description, tags, and links.
   - Or click **"+ Add New"** to add a new project to your portfolio.
5. Click **"Save Project Changes"** or **"Apply Personal Info Changes"** to see your portfolio update instantly!
6. Click **"Copy Updated portfolio-data.js Code"** to copy the full JavaScript configuration if you'd like to save it permanently into the file.

---

### Method B: Directly Editing `portfolio-data.js` (Recommended for Developers)
All portfolio content is centralized in a clean, single file: **[`portfolio-data.js`](./portfolio-data.js)**.

#### 1. Change Your Name & Personal Information
Open `portfolio-data.js` and edit the `personal` object:
```javascript
personal: {
  name: "Sagar",                       // <-- Your first name
  surname: "Kumar",                   // <-- Your surname
  role: "Frontend Software Developer", // <-- Your job role
  headline: "Crafting scalable, user-centric web applications and developer tools.",
  aboutShort: "I build exceptional, accessible, and high-performance digital products...",
  email: "sagar.dev@example.com",     // <-- Your email
  location: "Bengaluru, India",       // <-- Your city & country
  socials: {
    github: "https://github.com/your-username",
    linkedin: "https://linkedin.com/in/your-username",
    twitter: "https://twitter.com/your-username"
  }
}
```

#### 2. Change Project Names & Details
Find the `projects` array in `portfolio-data.js`:
```javascript
projects: [
  {
    id: "my-project-1",
    title: "GPRM (GitHub Profile Readme Maker)", // <-- Change to your project's name
    category: "Dev Tools",                      // <-- "Dev Tools", "Full Stack", "Open Source"
    featured: true,
    badge: "⭐ 1.8k+ Stars",                    // <-- Pill badge
    shortDescription: "A no-code tool that helps developers craft stunning READMEs...",
    tags: ["React.js", "Next.js", "Tailwind CSS"],
    image: "https://your-image-url.com/preview.jpg",
    liveUrl: "https://your-live-demo.com",      // <-- Live demo link
    githubUrl: "https://github.com/your-repo",  // <-- GitHub source link
    metrics: "150K+ Monthly Active Users"
  },
  // Add as many projects as you like!
]
```

#### 3. Update Skills, Experience & Stats
- **`stats`**: Change the numbers for Products Built, Users Reached, Stars, etc.
- **`skills`**: Add or remove skills under Frontend, Backend, or DevOps.
- **`experience`**: Add your past companies, job titles, and achievements.

---

## 🌐 Deploying to the Web (Free)

### Deploy to GitHub Pages
1. Push this folder to a GitHub repository (e.g., `sagar-portfolio`).
2. Go to repository **Settings** -> **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Your portfolio will be live at `https://<your-username>.github.io/sagar-portfolio/`!

### Deploy to Vercel
1. Run `npx vercel` inside this folder, or connect your GitHub repository on [vercel.com](https://vercel.com).
2. It will automatically detect static files and deploy instantly with global CDN caching.

### Deploy to Netlify
1. Drag and drop this folder directly into the [Netlify Drop](https://app.netlify.com/drop) dashboard.
2. Your site is live in 10 seconds!

---

## 📁 File Structure

```text
sagar portfolio/
├── index.html           # Main portfolio layout & markup
├── styles.css           # Ambient glow, dark/light themes, custom animations
├── portfolio-data.js    # Single source of truth configuration (Name, Projects, Skills)
├── app.js               # Reactive rendering, category filters & live customizer logic
├── server.js            # Lightweight zero-dependency local Node server
├── package.json         # Project metadata and quick start scripts
└── README.md            # Complete documentation and customization guide
```

---

## 💡 Inspiration Credit
Design, layout, and tool structure inspired by the work of **Vishwa Gaurav**.

