import Topbar from '@/components/Topbar';
import MainHeader from '@/components/MainHeader';
import ActionButtons from '@/components/ActionButtons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Topbar />
      <MainHeader />
      <ActionButtons />
      <Navbar />
      
      <main className="flex-1 bg-slate-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full text-center bg-white p-10 md:p-14 rounded-3xl border border-slate-100 shadow-md">
          <span className="text-5xl mb-4 block">🏛️</span>
          <h1 className="text-[#000066] text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Welcome to Periyar University
          </h1>
          <p className="text-slate-500 text-base md:text-lg mb-8 leading-relaxed font-semibold">
            Explore our academic schools, specialized department portals, and course curriculums.
          </p>
          <div className="flex justify-center">
            <Link
              href="/dept"
              className="inline-flex items-center gap-2 bg-[#990033] hover:bg-[#80002a] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer no-underline text-base"
            >
              Explore Departments
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
