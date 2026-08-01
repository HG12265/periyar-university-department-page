import "./globals.css";
import FetchInterceptor from "@/components/FetchInterceptor";

export const metadata = {
  title: "Periyar University | Salem",
  description: "Official Website Clone of Periyar University, Salem",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col m-0 p-0 font-sans text-gray-900 bg-gray-50" suppressHydrationWarning>
        <FetchInterceptor />
        {children}
      </body>
    </html>
  );
}
