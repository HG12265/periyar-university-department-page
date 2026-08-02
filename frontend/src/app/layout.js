import "./globals.css";
import FetchInterceptor from "@/components/FetchInterceptor";

export const metadata = {
  title: "Periyar University, Salem",
  description: "Schools and Departments",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Periyar University, Salem",
    description: "Schools and Departments",
    url: "https://periyaruniversity.site",
    siteName: "Periyar University, Salem",
    images: [
      {
        url: "https://periyaruniversity.site/logo.png",
        width: 800,
        height: 800,
        alt: "Periyar University Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Periyar University, Salem",
    description: "Schools and Departments",
    images: ["https://periyaruniversity.site/logo.png"],
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
