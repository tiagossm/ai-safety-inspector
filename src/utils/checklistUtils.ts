
import { CollaboratorType } from "@/types/checklist";

/**
 * Generates mock collaborators for development purposes
 */
export function generateMockCollaborators(count: number): CollaboratorType[] {
  const names = ["Ana Silva", "Bruno Costa", "Carla Lima", "Daniel Freitas", "Eduardo Santos", "Fernanda Oliveira"];
  const collaborators: CollaboratorType[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const nameParts = name.split(" ");
    const initials = nameParts.map(part => part[0]).join("");
    
    collaborators.push({
      id: `mock-${i}`,
      name,
      avatar: "",
      initials
    });
  }
  
  return collaborators;
}
