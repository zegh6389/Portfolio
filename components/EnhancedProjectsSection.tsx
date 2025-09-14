"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Grid3x3, List, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EnhancedProjectCard from "./EnhancedProjectCard";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  technologies: string[];
  category: string;
  github_link?: string;
  demo_link?: string;
  featured?: boolean;
}

interface ProfileProjectsData {
  projects_title: string;
  projects_subtitle: string;
}

export default function EnhancedProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profileData, setProfileData] = useState<ProfileProjectsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const projectsPerPage = 6;

  const PROFILE_ID = "f45427e8-634a-4713-a2e6-15582e796472";

  useEffect(() => {
    async function fetchData() {
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("profile_id", PROFILE_ID);

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
      } else {
        setProjects(projectsData);
      }

      // Fetch profile text content
      const { data: profileInfo, error: profileError } = await supabase
        .from("profiles")
        .select("projects_title, projects_subtitle")
        .eq("id", PROFILE_ID)
        .single();

      if (profileError) {
        console.error("Error fetching profile projects data:", profileError);
        setProfileData({
          projects_title: "Featured Projects",
          projects_subtitle: "Explore my latest work and creative solutions built with modern technologies",
        });
      } else {
        setProfileData(profileInfo);
      }
    }
    fetchData();
  }, []);

  const categories = useMemo(() => {
    if (projects.length === 0) return ["All"];
    const projectCategories = projects.map(p => p.category);
    return ["All", ...Array.from(new Set(projectCategories))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(trimmedSearch) ||
        project.description.toLowerCase().includes(trimmedSearch) ||
        project.technologies.some(tech => tech.toLowerCase().includes(trimmedSearch));
      const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
      const matchesFeatured = !showFeaturedOnly || project.featured;
      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [projects, searchTerm, selectedCategory, showFeaturedOnly]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * projectsPerPage;
    return filteredProjects.slice(startIndex, startIndex + projectsPerPage);
  }, [filteredProjects, currentPage, projectsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (!profileData) {
    return <div className="py-20 text-center">Loading projects...</div>;
  }

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
              {profileData.projects_title}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {profileData.projects_subtitle}
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
