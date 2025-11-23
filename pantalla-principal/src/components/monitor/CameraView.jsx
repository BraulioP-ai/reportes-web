import { Video } from "lucide-react";

export default function CameraView({ darkMode }) {
  return (
    <>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Video /> Monitor de Acceso
      </h2>
      <div className="bg-black w-full aspect-video rounded-lg flex items-center justify-center text-gray-400">
        CÁMARA EN VIVO
      </div>
    </>
  );
}