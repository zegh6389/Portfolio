"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Download, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  Globe,
  Code2,
  Sparkles,
  Star,
  ChevronRight,
  User,
  FileText,
  Target,
  Zap,
  Rocket,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// 3D Card Component with mouse tracking
function Card3D({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const smoothRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    
    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative preserve-3d", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative z-10" style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
      
      {/* 3D Shadow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-3xl blur-2xl"
        style={{
          transform: "translateZ(-50px)",
          opacity: isHovered ? 0.8 : 0.4,
        }}
        animate={{ opacity: isHovered ? 0.8 : 0.4 }}
      />
    </motion.div>
  );
}

// Floating Particle Component
function FloatingParticle({ index = 0, delay = 0 }: { index?: number; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use deterministic values based on index
  const startX = ((index * 37) % 100) - 50;
  const startY = ((index * 53) % 100) - 50;
  const endX = ((index * 71) % 200) - 100;
  const endY = ((index * 89) % 200) - 100;
  const duration = 5 + (index % 5);

  // Return a placeholder div during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className="absolute w-1 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-0"
        style={{
          transform: `translate(${startX}px, ${startY}px)`
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute w-1 h-1 bg-gradient-to-r from-primary to-purple-600 rounded-full"
      initial={{ 
        x: startX,
        y: startY,
        opacity: 0 
      }}
      animate={{
        x: endX,
        y: endY,
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    />
  );
}

// Timeline Item with 3D effect
function TimelineItem({ 
  title, 
  company, 
  period, 
  location, 
  description, 
  technologies,
  index,
  isLeft 
}: {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
  technologies: string[];
  index: number;
  isLeft: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "relative flex items-center",
        isLeft ? "justify-end md:pr-8" : "justify-start md:pl-8"
      )}
    >
      {/* Timeline Node */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-lg z-20"
        whileHover={{ scale: 1.5 }}
        style={{ transform: "translateZ(30px)" }}
      >
        <motion.div
          className="absolute inset-0 bg-primary rounded-full"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      {/* Content Card */}
      <Card3D className={cn("w-full md:w-5/12", isLeft ? "text-right" : "text-left")}>
        <div className="p-6 bg-background/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
          <div className={cn("flex items-start gap-3 mb-3", isLeft ? "flex-row-reverse" : "")}>
            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">{title}</h3>
              <p className="text-primary font-medium">{company}</p>
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground mt-1", isLeft ? "justify-end" : "")}>
                <Calendar className="w-3 h-3" />
                <span>{period}</span>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          
          <div className={cn("flex flex-wrap gap-2", isLeft ? "justify-end" : "")}>
            {technologies.map((tech, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="text-xs bg-white/5 border-white/10"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}

// Main Resume Component
export default function Resume3D() {
  const [activeSection, setActiveSection] = useState("experience");
  const [isDownloading, setIsDownloading] = useState(false);
  
  const workExperience = [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Innovations Inc.",
      period: "2022 - Present",
      location: "San Francisco, CA",
      description: "Leading development of enterprise-scale web applications using React, Next.js, and Node.js. Architected microservices infrastructure serving 1M+ users.",
      technologies: ["React", "Next.js", "Node.js", "AWS", "Docker", "PostgreSQL"]
    },
    {
      title: "Full Stack Developer",
      company: "Digital Solutions Ltd.",
      period: "2020 - 2022",
      location: "New York, NY",
      description: "Developed and maintained multiple client projects, improving performance by 40% and reducing load times by 60% through optimization.",
      technologies: ["React", "TypeScript", "Express", "MongoDB", "Redis"]
    },
    {
      title: "Frontend Developer",
      company: "Creative Agency",
      period: "2019 - 2020",
      location: "Remote",
      description: "Built responsive, accessible web interfaces for various clients. Implemented modern design systems and component libraries.",
      technologies: ["React", "Vue.js", "SASS", "Webpack", "Jest"]
    }
  ];
  
  const education = [
    {
      degree: "Bachelor of Computer Science",
      institution: "University of Technology",
      period: "2015 - 2019",
      achievements: ["Dean's List", "GPA: 3.8/4.0", "Best Capstone Project"]
    }
  ];
  
  const achievements = [
    { icon: Trophy, label: "AWS Certified Developer", color: "from-yellow-500 to-orange-500" },
    { icon: Award, label: "Best Innovation Award 2023", color: "from-purple-500 to-pink-500" },
    { icon: Star, label: "5-Star Developer Rating", color: "from-blue-500 to-cyan-500" },
    { icon: Target, label: "100% Project Success Rate", color: "from-green-500 to-emerald-500" }
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download - replace with actual PDF download logic
    setTimeout(() => {
      setIsDownloading(false);
      // Add actual download logic here
      console.log("Downloading resume...");
    }, 2000);
  };

  return (
    <section id="resume" className="relative py-20 overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
        
        {/* Animated Mesh Gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(255, 219, 98, 0.3) 0%, transparent 50%)"
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <FloatingParticle key={i} index={i} delay={i * 0.2} />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-block mb-4"
          >
            <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Resume
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my professional journey and expertise
          </p>
        </motion.div>
        
        {/* Main Resume Card with 3D Effect */}
        <Card3D className="max-w-6xl mx-auto">
          <div className="bg-background/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="relative p-8 bg-gradient-to-br from-primary/20 via-purple-600/20 to-pink-600/20">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                  }}
                  animate={{ 
                    x: [0, 10, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
              </div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center flex flex-col items-center"
                >
                  {/* Profile Photo Frame */}
                  <div className="relative mb-6 group">
                    <div className="w-40 h-40 rounded-full relative overflow-hidden shadow-xl shadow-primary/20 border border-white/20">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/30 via-purple-600/30 to-pink-600/30 opacity-40 group-hover:opacity-60 transition-opacity" />
                      <Image
                        src={encodeURI("/WhatsApp Image 2025-07-19 at 19.55.01_826fe709.jpg")}
                        alt="Profile photo"
                        fill
                        className="object-cover rounded-full select-none"
                        sizes="160px"
                        priority
                      />
                      {/* Inner subtle ring */}
                      <div className="absolute inset-0 rounded-full ring-2 ring-white/10" />
                    </div>
                    {/* Glow ring */}
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary/40 via-purple-600/30 to-pink-600/40 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Awais Zegham
                  </h1>
                  <p className="text-xl text-primary mb-4">Senior Full Stack Developer</p>
                  
                  {/* Contact Info */}
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <a href="mailto:Awaiszegham374@gmail.com" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Mail className="w-4 h-4" />
                      Awaiszegham374@gmail.com
                    </a>
                    <a href="tel:+12899462124" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Phone className="w-4 h-4" />
                      +1 (289) 946-2124
                    </a>
                    <a href="https://github.com/zegh6389" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/awais-zegham-38201b272/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                    <a href="https://Awaiszegham.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Globe className="w-4 h-4" />
                      Portfolio
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Professional Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="p-8 border-b border-white/10"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Professional Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Innovative Full Stack Developer with 5+ years of experience building scalable web applications 
                and leading development teams. Expertise in React, Next.js, Node.js, and cloud technologies. 
                Passionate about creating exceptional user experiences and solving complex technical challenges. 
                Proven track record of delivering high-quality solutions that drive business growth and user engagement.
              </p>
            </motion.div>
            
            {/* Section Tabs */}
            <div className="flex border-b border-white/10">
              {["experience", "education", "achievements"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={cn(
                    "flex-1 py-4 px-6 font-medium capitalize transition-all",
                    activeSection === section
                      ? "bg-primary/10 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {section}
                </button>
              ))}
            </div>
            
            {/* Section Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* Work Experience Timeline */}
                {activeSection === "experience" && (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary via-purple-600 to-pink-600" />
                    
                    <div className="space-y-12">
                      {workExperience.map((exp, index) => (
                        <TimelineItem
                          key={index}
                          {...exp}
                          index={index}
                          isLeft={index % 2 === 0}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education Section */}
                {activeSection === "education" && (
                  <div className="space-y-6">
                    {education.map((edu, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card3D>
                          <div className="p-6 bg-background/60 backdrop-blur-xl rounded-2xl border border-white/10">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-foreground">{edu.degree}</h3>
                                <p className="text-primary font-medium">{edu.institution}</p>
                                <p className="text-sm text-muted-foreground mb-3">{edu.period}</p>
                                <div className="flex flex-wrap gap-2">
                                  {edu.achievements.map((achievement, i) => (
                                    <Badge key={i} className="bg-primary/10 text-primary border-primary/20">
                                      {achievement}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card3D>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Achievements Section */}
                {activeSection === "achievements" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card3D>
                            <div className="p-6 bg-background/60 backdrop-blur-xl rounded-2xl border border-white/10">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                                  achievement.color
                                )}>
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-foreground">{achievement.label}</h4>
                                  <p className="text-sm text-muted-foreground">Verified Achievement</p>
                                </div>
                              </div>
                            </div>
                          </Card3D>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Download Section */}
            <div className="p-8 bg-gradient-to-r from-primary/10 via-purple-600/10 to-pink-600/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Download Full Resume
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get a detailed PDF version with complete work history
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                  >
                    {isDownloading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Resume PDF
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </Card3D>
        
        {/* Floating Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-8"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-background/80 backdrop-blur-xl rounded-full border border-white/10 shadow-lg hover:border-primary/50 transition-colors"
          >
            <Mail className="w-5 h-5 text-primary" />
          </motion.a>
          <motion.a
            href="https://github.com"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-background/80 backdrop-blur-xl rounded-full border border-white/10 shadow-lg hover:border-primary/50 transition-colors"
          >
            <Github className="w-5 h-5 text-primary" />
          </motion.a>
          <motion.a
            href="https://linkedin.com"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-background/80 backdrop-blur-xl rounded-full border border-white/10 shadow-lg hover:border-primary/50 transition-colors"
          >
            <Linkedin className="w-5 h-5 text-primary" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
