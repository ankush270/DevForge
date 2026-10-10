# AI-Generated Website Detection Guide (विस्तृत गाइड)

Yeh guide batati hai ki kisi website ko dekh kar ya uske code ka forensic analysis karke kaise pehchana jaye ki wo **AI tools (v0.dev, Lovable.dev, Bolt.new, Cursor, Framer AI, ChatGPT)** ke through banayi gayi hai.

---

## 📑 Table of Contents
1. [Visual UI/UX Signatures (3-Second Visual Smell)](#1-visual-uiux-signatures-3-second-visual-smell)
2. [Source Code & DevTools Forensics](#2-source-code--devtools-forensics)
3. [Content & Copywriting (LLM Signatures)](#3-content--copywriting-llm-signatures)
4. [Media & Image Forensics](#4-media--image-forensics)
5. [Backend & Functionality (The Facade Test)](#5-backend--functionality-the-facade-test)
6. [Detection Tools & Checklist](#6-detection-tools--checklist)

---

## 1. Visual UI/UX Signatures (3-Second Visual Smell)

Tech industry me is look ko **"The v0 / Shadcn Syndrome"** ya **"Modern Dark SaaS Boilerplate"** kaha jata hai.

### A. Hero Section ka Fixed Formula (90% AI Sites)
AI lagbhag hamesha ek hi exact structure generate karta hai:

```text
       [ ✨ Introducing v2.0  → ]             <-- Rounded Capsule Badge
              
   Transform Your Workflow                   <-- Giant Bold Heading
      with Next-Gen AI                       <-- Gradient Mask (White to Purple/Cyan)

  Boost your team's productivity by 10x      <-- 2-line Subheading
    with our intelligent automation.

    [ Get Started Free → ]  [ Book Demo ]      <-- 1 High-contrast Solid + 1 Outline Button
```

* **The Background Radial Glow:** Heading ke peeche ya neeche ek **Purple, Indigo ya Cyan blurry circular gradient (glow blob)** float kar raha hota hai.
* **Tilted Mockup:** Buttons ke theek neeche ek tilted laptop mockup ya floating glassmorphism dashboard card hota hai (`border border-white/10`).

---

### B. Wahi 4 Lucide Icons ka Overuse
AI feature cards me context ke hisab se custom illustrations banane ke bajaye hamesha 4 standard icons pick karta hai:

| Icon | Kiske liye use hota hai | AI Card Title |
| :--- | :--- | :--- |
| ⚡ **Zap / Lightning** | Speed & Performance | *"Lightning Fast Execution"* |
| 🛡️ **Shield** | Security | *"Enterprise-Grade Security"* |
| ✨ **Sparkles** | Automation / Magic | *"AI-Powered Intelligence"* |
| 🚀 **Rocket / TrendingUp** | Scaling | *"Effortless Scalability"* |

*Har card ke top-left par ek chhota box (`w-10 h-10 rounded-lg bg-primary/10`) hoga jisme ye icon set hoga.*

---

### C. Bento Grid & Fake Data Charts
* **Bento Grid Obsession:** AI features ko hamesha rounded asymmetrical cards me divide karta hai.
* **Fake Bezier Line Charts:** Bento grid me ek smooth gradient-filled line chart hoga, lekin usme **koi X/Y axis data ya actual numbers nahi hote**; wo sirf visual filler SVG hota hai.
* **Non-functional Toggles:** Card ke andar toggle switches ya sliders sirf decoration ke liye hote hain.

---

### D. Carbon-Copy Pricing Table
* Hamesha **3 Tiers**: *Free*, *Pro*, *Enterprise*.
* **Middle Card ("Pro") Glows:** Middle card ko `scale-105` karke thoda bada kiya jata hai, glowing border diya jata hai, aur upar badge hota hai: **"Most Popular"** ya **"Best Value"**.
* Har bullet point ke aage ek green ya white `✓` (Checkmark) icon hota hai.

---

### E. Monochrome Logo Marquee & Fake Testimonials
* **Grey Logo Infinite Scroll:** *"Trusted by 10,000+ teams"* ke neeche 5-6 monochrome grey logos automatically scroll kar rahe hote hain (jo aksar random geometry shapes ya unauthorized brand silhouettes hote hain).
* **Testimonials:**
  * 5 Yellow Stars (`★★★★★`).
  * Unsplash models ya AI-generated ultra-smooth plastic facial portraits.
  * Generic designations: *"Alex Rivera, CTO at TechCorp"*, *"Sarah Chen, Growth Lead"*.

---

### F. Emotionless Color Palette & Typography
* **Typography:** 95% websites me **Inter** ya **Geist** font hi hota hai. Brand ke according koi unique display/serif typography nahi hoti.
* **Colors:** Default Dark Mode (`#09090b` Zinc-950 ya `#030712` Slate-950) with white text aur indigo/violet accents.

---

## 2. Source Code & DevTools Forensics

Browser me **F12 (DevTools)** ya **Right-Click > Inspect** karke ye signals check karein:

### A. Meta Generator Tags
HTML ke `<head>` tag me builder ka signature dhoondein:
```html
<meta name="generator" content="Lovable" />
<!-- ya Framer / 10Web / Durable / Hostinger AI -->
```

### B. Network & Asset Endpoints
Network tab me CSS/JS ya images ke URLs dekhein:
* `*.lovableproject.com` ya `*.lovable.app`
* `v0.blob.com` ya `v0.dev` build endpoints
* `bolt.new` / `stackblitz` default deploy domains
* Image assets loading from `replicate.delivery/...` ya `fal.ai`

### C. Default Favicon (Common Oversight)
Bahut se creators jaldbazi me default icon change karna bhool jate hain:
* **Vite logo:** Purple aur yellow triangle icon.
* **Next.js logo:** Black circle me white 'N'.
* **Builder icons:** Lovable flame icon ya Supabase lightning icon.

### D. Shadcn/ui & Tailwind CSS Signatures
Classes me exact Shadcn UI tokens ka repetition:
```html
<div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
  <button class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
```

---

## 3. Content & Copywriting (LLM Signatures)

### A. Cliché AI Vocabulary
Agar text me ye words bar-bar dikhein:
* *"In today's fast-paced digital landscape..."*
* *"Harness the power of..."*
* *"Seamlessly integrate..."*
* *"Supercharge / Tapestry / Beacon / Delve into / Revolutionize / Elevate"*

### B. Structural Symmetry
* Har feature list ki line length lagbhag barabar hoti hai.
* Har bullet point ka sentence structure identical hota hai:
  * `[Action Verb] your [Noun] to achieve [Benefit]`.

### C. Dummy & Placeholder Data
* Social media links click karne par `href="#"` ya direct homepage par redirect hota hai.
* Contact address: *"123 Innovation Drive, Tech City"* ya phone: `+1 (555) 000-0000`.
* Privacy policy me company name ki jagah `[Company Name]` ya generic standard template text.

---

## 4. Media & Image Forensics

* **Anatomical & Text Glitches:** Background ke posters/signs par text ulta-seedha hota hai. Haathon, ungliyon (fingers) ya accessories me asymmetry.
* **Cinematic Plastic Skin:** Midjourney ya Flux ka typical hyper-smooth, glowing lighting texture.
* **C2PA Metadata:** Image download karke EXIF inspector me dekhein; DALL-E aur Adobe Firefly images me C2PA standard metadata me *"Generated by AI"* likha hota hai.

---

## 5. Backend & Functionality (The Facade Test)

AI builders attractive frontend fatafat bana dete hain lekin deep backend connect nahi hota:

1. **Fake Form Submissions:** Contact form me dummy data bharke Submit karein. Agar bina kisi network request ke turant *"Message sent successfully!"* toast aa jaye, toh wo sirf frontend prototype hai.
2. **Search Bar Dummy Filter:** Search bar sirf 3-4 local static JSON items ko filter karega ya kuch nahi karega.
3. **Dead Nav Links:** *"Docs"*, *"Pricing"*, *"About"* links page par `#` reload karte hain.

---

## 6. Detection Tools & Checklist

| Tool | Purpose |
| :--- | :--- |
| **Inspect Element / DevTools** | Generator tags, asset URLs, default icons, console logs |
| **Wappalyzer / BuiltWith** | Frameworks, site builders, hosting details |
| **Google Lens / TinEye** | Images ka origin verify karne ke liye |
| **GPTZero / Winston AI** | Copywriting text ka LLM probability score |
| **Whois Lookup** | Domain creation date (2-3 din purana domain + complex site = AI) |

---

### Quick Verdict Rule
Agar website me:
1. Dark Mode (`#09090b`) + Purple radial blur hai,
2. Hero section me Capsule Badge (`✨`) + Lucide icons (`⚡`, `🛡️`) hain,
3. Favicon default Vite/Next.js hai, aur
4. Form submit karne par actual API request nahi ja rahi —

**Toh wo 100% AI ke prompt se bani hui website hai.**
