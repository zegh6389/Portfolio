# Dynamic Portfolio with Supabase

This is a flexible, data-driven portfolio template built with Next.js, Tailwind CSS, and Framer Motion. The entire portfolio is powered by a Supabase backend, allowing for easy content management without touching the code. It's designed to be easily customizable for students and developers to showcase their work.

## Features

- **Dynamic Content:** All content, including personal information, skills, and projects, is fetched from Supabase.
- **Admin-Friendly:** Easily manage all portfolio content directly through the Supabase dashboard.
- **Modern Tech Stack:** Built with Next.js App Router, TypeScript, and Tailwind CSS.
- **Rich Animations:** Smooth page transitions and interactive elements powered by Framer Motion.
- **Responsive Design:** Looks great on all devices, from mobile phones to desktops.
- **Dark/Light Mode:** Includes a theme toggler for user preference.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Backend:** [Supabase](https://supabase.io/) (Database, Auth, Storage)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Supabase

This project requires a Supabase project to function as the backend.

1.  **Create a Supabase Project:**
    - Go to [supabase.com](https://supabase.com/) and create a new project.
    - Save your **Project URL** and **`anon` public key**.

2.  **Set up Database Schema:**
    - In your Supabase project, go to the **SQL Editor**.
    - Click **New query** and paste the entire SQL script below to create all the necessary tables and relationships. Click **Run**.

    ```sql
    -- 1. PROFILES TABLE (Main table for a user's portfolio)
    CREATE TABLE profiles (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      hero_description TEXT,
      hero_tech_stack TEXT[],
      skills_title TEXT,
      skills_subtitle TEXT,
      stats_technologies TEXT,
      stats_experience TEXT,
      stats_projects TEXT,
      stats_clients TEXT,
      projects_title TEXT,
      projects_subtitle TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2. HERO_ROLES TABLE (Rotating roles for the hero section)
    CREATE TABLE hero_roles (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      role_name TEXT NOT NULL,
      "order" INTEGER
    );

    -- 3. SKILLS TABLE
    CREATE TABLE skills (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level INTEGER NOT NULL,
      category TEXT NOT NULL
    );

    -- 4. PROJECTS TABLE
    CREATE TABLE projects (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      technologies TEXT[],
      category TEXT,
      github_link TEXT,
      demo_link TEXT,
      featured BOOLEAN DEFAULT false
    );
    ```

3.  **Add Sample Data (Optional but Recommended):**
    - After creating the tables, you can run the following SQL in the SQL Editor to insert some sample data.
    - **Important:** Replace `'f45427e8-634a-4713-a2e6-15582e796472'` with a new UUID you generate, or use the one provided. If you use a new one, make sure to update it in the components (`EnhancedHero.tsx`, `EnhancedSkills.tsx`, etc.) where `PROFILE_ID` is hardcoded.

    ```sql
    -- Insert into profiles
    INSERT INTO profiles (id, name, hero_description, hero_tech_stack, skills_title, skills_subtitle, stats_technologies, stats_experience, stats_projects, stats_clients, projects_title, projects_subtitle)
    VALUES ('f45427e8-634a-4713-a2e6-15582e796472', 'Your Name', 'Your personal description here.', '{"React", "Next.js", "TypeScript"}', 'Skills & Expertise', 'My technical toolkit.', '20+', '5+', '50+', '30+', 'Featured Projects', 'A selection of my best work.');

    -- Insert into hero_roles
    INSERT INTO hero_roles (profile_id, role_name, "order")
    VALUES ('f45427e8-634a-4713-a2e6-15582e796472', 'Full Stack Developer', 1), ('f45427e8-634a-4713-a2e6-15582e796472', 'Creative Thinker', 2);

    -- Insert into skills
    INSERT INTO skills (profile_id, name, level, category)
    VALUES ('f45427e8-634a-4713-a2e6-15582e796472', 'React/Next.js', 95, 'Frontend'), ('f45427e8-634a-4713-a2e6-15582e796472', 'Node.js', 88, 'Backend');

    -- Insert into projects
    INSERT INTO projects (profile_id, title, description, image_url, technologies, category, github_link, demo_link, featured)
    VALUES ('f45427e8-634a-4713-a2e6-15582e796472', 'AI Task Manager', 'An intelligent task management tool.', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop', '{"Next.js", "AI"}', 'Full Stack', 'https://github.com', 'https://demo.com', true);
    ```

### 5. Set Up Environment Variables

1.  Create a new file named `.env.local` in the root of your project.
2.  Add the following variables, replacing the placeholder values with your Supabase project's URL and anon key.

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

### 6. Run the Development Server

Now you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Future Work

This project provides a solid foundation for a dynamic portfolio. Here are some ideas for future improvements:

-   **Build an Admin Dashboard:** Create a protected, user-friendly interface for managing portfolio content, so you don't have to use the Supabase table editor directly.
-   **Full Multi-Tenancy:** Implement a user authentication system (with Supabase Auth) to allow multiple users to sign up and manage their own portfolios. This would involve dynamically setting the `PROFILE_ID` based on the logged-in user.
-   **Image Management:** Integrate [Supabase Storage](https://supabase.com/docs/guides/storage) to allow users to upload project images and a profile picture directly, rather than pasting URLs.
-   **Enhanced Customization:** Add options in the admin dashboard to control theme colors, fonts, and layout choices.
-   **Contact Form Integration:** Connect the contact form to a service like Resend or store submissions in a Supabase table.
-   **CI/CD Pipeline:** Set up a CI/CD pipeline with GitHub Actions to automate testing and deployments to a hosting provider like Vercel.
