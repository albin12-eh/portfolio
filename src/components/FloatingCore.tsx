import { useEffect, useRef } from "react";

interface FloatingCoreProps {
  theme: "dark" | "light";
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Icosahedron geometry (12 vertices, 20 triangular faces) built from the golden ratio.
const PHI = (1 + Math.sqrt(5)) / 2;

const BASE_VERTICES: Point3D[] = [
  { x: -1, y: PHI, z: 0 },
  { x: 1, y: PHI, z: 0 },
  { x: -1, y: -PHI, z: 0 },
  { x: 1, y: -PHI, z: 0 },
  { x: 0, y: -1, z: PHI },
  { x: 0, y: 1, z: PHI },
  { x: 0, y: -1, z: -PHI },
  { x: 0, y: 1, z: -PHI },
  { x: PHI, y: 0, z: -1 },
  { x: PHI, y: 0, z: 1 },
  { x: -PHI, y: 0, z: -1 },
  { x: -PHI, y: 0, z: 1 },
];

const FACES: [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

// Derive a unique, de-duplicated edge list from the face list.
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  FACES.forEach(([a, b, c]) => {
    [[a, b], [b, c], [c, a]].forEach(([i, j]) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    });
  });
  return edges;
})();

export default function FloatingCore({ theme }: FloatingCoreProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 400;
    let height = 400;

    const resize = () => {
      const parent = containerRef.current;
      if (parent) {
        width = parent.clientWidth || 400;
        height = parent.clientHeight || 400;
      }
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    // 3D projection parameters
    const fov = 340;
    const cameraDistance = 300;

    // Continuous autonomous spin, gently biased by the mouse position.
    let spinX = 0.35;
    let spinY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;
      targetTiltY = (mx / (width / 2)) * 0.5;
      targetTiltX = -(my / (height / 2)) * 0.5;
    };

    const handleMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const coreScale = 78;
    const scaledVertices = BASE_VERTICES.map((v) => ({
      x: v.x * (coreScale / PHI) * 0.951,
      y: v.y * (coreScale / PHI) * 0.951,
      z: v.z * (coreScale / PHI) * 0.951,
    }));

    // Halo particles drifting on an outer shell around the core.
    const numParticles = 22;
    const particles = Array.from({ length: numParticles }, (_, i) => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.acos(2 * (i / numParticles) - 1),
      radius: coreScale * 1.9 + Math.random() * 20,
      speed: 0.15 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const rotatePoint = (p: Point3D, rx: number, ry: number): Point3D => {
      // Rotate around X
      const y1 = p.y * Math.cos(rx) - p.z * Math.sin(rx);
      const z1 = p.y * Math.sin(rx) + p.z * Math.cos(rx);
      // Rotate around Y
      const x2 = p.x * Math.cos(ry) + z1 * Math.sin(ry);
      const z2 = -p.x * Math.sin(ry) + z1 * Math.cos(ry);
      return { x: x2, y: y1, z: z2 };
    };

    const project = (p: Point3D) => {
      const depth = p.z + cameraDistance;
      const scale = fov / depth;
      return {
        x: p.x * scale + width / 2,
        y: p.y * scale + height / 2,
        scale,
        depth: p.z,
      };
    };

    const render = () => {
      time += 0.016;

      // Autonomous rotation never stops; the mouse only adds a gentle extra tilt on top.
      spinY += 0.006;
      spinX = 0.35 + Math.sin(time * 0.25) * 0.08;
      tiltX += (targetTiltX - tiltX) * 0.05;
      tiltY += (targetTiltY - tiltY) * 0.05;

      const rx = spinX + tiltX;
      const ry = spinY + tiltY;

      ctx.clearRect(0, 0, width, height);

      const isDark = theme === "dark";
      const cyan = isDark ? "#00ff41" : "#067a2e";
      const violet = isDark ? "#39ff88" : "#0e8f4a";
      const edgeColor = isDark ? "rgba(0, 255, 65, 0.5)" : "rgba(6, 122, 46, 0.45)";
      const faceColorDim = isDark ? "rgba(0, 255, 65, 0.05)" : "rgba(6, 122, 46, 0.05)";
      const faceColorLit = isDark ? "rgba(0, 255, 65, 0.16)" : "rgba(6, 122, 46, 0.12)";

      const bobY = Math.sin(time * 0.8) * 8;

      // Project the core's vertices.
      const projected = scaledVertices.map((v) => {
        const rotated = rotatePoint(v, rx, ry);
        return project({ ...rotated, y: rotated.y + bobY });
      });

      // Draw faces back-to-front for a convincing solid look.
      const sortedFaces = FACES
        .map((face) => ({
          face,
          depth: (projected[face[0]].depth + projected[face[1]].depth + projected[face[2]].depth) / 3,
        }))
        .sort((a, b) => a.depth - b.depth);

      sortedFaces.forEach(({ face }) => {
        const [a, b, c] = face;
        // Simple depth-based shade: faces nearer the camera read as more "lit".
        const litAmount = (projected[a].depth + projected[b].depth + projected[c].depth) / 3;
        const t = Math.max(0, Math.min(1, (litAmount + coreScale) / (coreScale * 2)));

        ctx.beginPath();
        ctx.moveTo(projected[a].x, projected[a].y);
        ctx.lineTo(projected[b].x, projected[b].y);
        ctx.lineTo(projected[c].x, projected[c].y);
        ctx.closePath();
        ctx.fillStyle = t > 0.5 ? faceColorLit : faceColorDim;
        ctx.fill();
      });

      // Wireframe edges on top of the faces.
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 1.3;
      EDGES.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projected[a].x, projected[a].y);
        ctx.lineTo(projected[b].x, projected[b].y);
        ctx.stroke();
      });

      // Vertex nodes with a soft glow.
      projected.forEach((p) => {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 4 * p.scale);
        grad.addColorStop(0, cyan);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, 4 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Glowing pulsing center.
      const centerProj = project({ x: 0, y: bobY, z: 0 });
      const pulse = 14 + Math.sin(time * 2) * 3;
      const coreGrad = ctx.createRadialGradient(
        centerProj.x, centerProj.y, 0,
        centerProj.x, centerProj.y, pulse
      );
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.4, cyan);
      coreGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.fillStyle = coreGrad;
      ctx.arc(centerProj.x, centerProj.y, pulse, 0, Math.PI * 2);
      ctx.fill();

      // Drifting outer halo particles, orbiting the whole core.
      const renderedParticles = particles.map((particle) => {
        const theta = particle.theta + time * particle.speed;
        const raw: Point3D = {
          x: particle.radius * Math.sin(particle.phi) * Math.cos(theta),
          y: particle.radius * Math.cos(particle.phi) + bobY,
          z: particle.radius * Math.sin(particle.phi) * Math.sin(theta),
        };
        const rotated = rotatePoint(raw, rx * 0.6, ry * 0.6);
        const proj = project(rotated);
        const twinkle = 0.6 + 0.4 * Math.sin(time * 2.5 + particle.phase);
        return { ...proj, twinkle };
      });

      renderedParticles
        .sort((a, b) => a.depth - b.depth)
        .forEach((p) => {
          const size = Math.max(1, 2.2 * p.scale * p.twinkle);
          ctx.beginPath();
          ctx.fillStyle = violet;
          ctx.globalAlpha = 0.55 * p.twinkle;
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
