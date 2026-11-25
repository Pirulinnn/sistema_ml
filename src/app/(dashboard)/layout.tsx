import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GlassFold } from '@/components/ui/GlassFold';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#050714] text-white font-sans selection:bg-cyan-400 selection:text-black relative overflow-x-hidden">
      {/* Fondo interactivo animado GlassFold */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <GlassFold
          color1="#162564"
          color2="#040612"
          color3="#38bdf8"
          speed={0.25}
          scale={0.9}
          noise={0.05}
          className="w-full h-full"
        />
      </div>

      {/* Luces difusas complementarias */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Contenido principal */}
      <div className="relative z-10 pb-28">
        {children}
      </div>
    </div>
  );
}
