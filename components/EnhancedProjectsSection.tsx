"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Grid3x3, List, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EnhancedProjectCard from "./EnhancedProjectCard";

// Sample project data - replace with your actual projects
const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment processing, inventory management, and real-time order tracking.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    technologies: ["React", "Node.js", "MongoDB", "Stripe", "Redis", "Docker"],
    category: "Full Stack",
    github: "https://github.com",
    demo: "https://demo.com",
    featured: true,
  },
  {
    id: 2,
    title: "AI Task Manager",
    description: "Intelligent task management tool with AI-powered prioritization, natural language processing for task creation, and predictive analytics for deadline management.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "OpenAI", "Vercel"],
    category: "Full Stack",
    github: "https://github.com",
    demo: "https://demo.com",
    featured: true,
  },
  {
    id: 3,
    title: "Weather Analytics Dashboard",
    description: "Advanced weather visualization platform with real-time data, predictive modeling, and interactive maps. Includes historical data analysis and custom alerts.",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop",
    technologies: ["React", "D3.js", "Chart.js", "OpenWeather API", "MapBox"],
    category: "Frontend",
    github: "https://github.com",
    demo: "https://demo.com",
    featured: false,
  },
  {
    id: 4,
    title: "Social Media API",
    description: "Scalable RESTful API for social media platform with GraphQL support, real-time notifications, and advanced caching strategies.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    technologies: ["Node.js", "GraphQL", "Redis", "MongoDB", "WebSocket"],
    category: "Backend",
    github: "https://github.com",
    demo: "https://demo.com",
    featured: false,
  },
  {
    id: 5,
    title: "3D Portfolio Showcase",
    description: "Immersive portfolio website featuring 3D animations, particle effects, and interactive experiences built with cutting-edge web technologies.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop",
    technologies: ["Next.js", "Three.js", "GSAP", "Framer Motion", "WebGL"],
    category: "Frontend",
    github: "https://github.com",
    demo: "https://demo.com",
    featured: true,
  },
  {
    id: 6,
    title: "Real-time Collaboration Suite",
    description: "Enterprise-grade collaboration platform with video conferencing, screen sharing, collaborative editing, and team analytics.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop",
    technologies: ["React", "Socket.io", "WebRTC", "Node.js", "Redis", "AWS"],
    category: "Full Stack",
    github: "https://github.com",
    demo: "https://demo.com",
    featured: false,
  },
];

const categories = ["All", "Full Stack", "Frontend", "Backend"];

export default function EnhancedProjectsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const projectsPerPage = 6;

  // Filter projects based on search, category, and featured status
  const filteredProjects = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    const result = projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesFeatured = !showFeaturedOnly || project.featured;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
    // Fallback: if nothing matches but user hasn't actually applied any constraint, return all
    const noRealFilters = trimmedSearch === "" && selectedCategory === "All" && !showFeaturedOnly;
    if (result.length === 0 && noRealFilters) return projects;
    return result;
  }, [searchTerm, selectedCategory, showFeaturedOnly]);

  // Expose for quick debugging in browser console
  if (typeof window !== 'undefined') {
    // @ts-expect-error - Adding debug property to window for development
    window.__debugProjects = { all: projects, filtered: filteredProjects };
  }

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my latest work and creative solutions built with modern technologies
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-8 space-y-4"
        >
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search projects, technologies..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-background/50 backdrop-blur-sm border-white/10"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-lg"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-lg"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Featured Toggle */}
            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              onClick={() => {
                setShowFeaturedOnly(!showFeaturedOnly);
                setCurrentPage(1);
              }}
              className="rounded-lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Featured Only
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className="rounded-full"
                >
                  {category}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedProjects.length} of {filteredProjects.length} projects
            </p>
            {filteredProjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        </motion.div>

        {/* Projects Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentPage}-${viewMode}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6 }}
            className={
              viewMode === "grid"
                ? "relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                : "relative space-y-6 mb-8"
            }
          >
            {/* Sweep overlay effect */}
            <motion.div
              className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_60%),linear-gradient(110deg,rgba(255,255,255,0.03)15%,rgba(255,255,255,0.06)35%,rgba(255,255,255,0.015)60%,transparent)] rounded-2xl opacity-0"
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
              whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {paginatedProjects.map((project, index) => (
              <EnhancedProjectCard
                key={project.id}
                project={project}
                index={index}
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No results message */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-block p-4 bg-muted/50 rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No projects found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-2"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full bg-background/50 backdrop-blur-sm border-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <motion.div
                      key={page}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page)}
                        className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border-white/10"
                      >
                        {page}
                      </Button>
                    </motion.div>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full bg-background/50 backdrop-blur-sm border-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
