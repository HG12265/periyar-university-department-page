export default function Topbar() {
  return (
    <div className="w-full bg-[#000066]">
      {/* Container simulating row with flex, h-40px on desktop, and auto height on mobile */}
      <div className="flex flex-col md:flex-row items-center md:h-[40px] text-[#ffffff] text-[12px] font-sans px-[15px] pt-2 md:pt-0 pb-3 md:pb-0 max-w-[1920px] mx-auto gap-2 md:gap-0">

        {/* Left Side: Slogan/Text */}
        <div className="w-full md:flex-1 text-center md:text-left font-tamil">
          அறிவால் விளையும் உலகு
        </div>

        {/* Center: Official Info (GST/CSR) */}
        <div className="w-full md:flex-1 text-center text-[10px] md:text-[12px]">
          GSTIN:33AAAJP0951B1ZP &nbsp; CSR Reg.No: CSR00061509
        </div>

        {/* Right Side: Controls (A+ A A-) & Social Icons */}
        <div className="w-full md:flex-1 flex justify-center md:justify-end items-center gap-4">

          {/* Font Controls */}
          <div className="flex items-center">
            <span className="bg-[#dc3545] text-white px-[10px] py-[3px] font-bold text-[13px] rounded cursor-pointer ml-1 md:ml-[10px]">A+</span>
            <span className="bg-[#dc3545] text-white px-[10px] py-[3px] font-bold text-[13px] rounded cursor-pointer ml-[5px]">A</span>
            <span className="bg-[#dc3545] text-white px-[10px] py-[3px] font-bold text-[13px] rounded cursor-pointer ml-[5px]">A-</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center md:ml-[115px]">
            <a href="https://www.facebook.com/profile.php?id=100085246909314" target="_blank" rel="noreferrer" className="px-[2px] md:py-[6px]" >
              <img src="/dept/fb.jpg" height="30" width="40" title="Facebook" alt="Facebook" className="h-[25px] md:h-[30px] w-auto" />
            </a>
            <a href="https://www.instagram.com/periyar_univesity_official/" target="_blank" rel="noreferrer" className="px-[2px] flex items-center" title="Instagram">
              <svg viewBox="0 0 24 24" className="h-[21px] md:h-[26px] w-auto rounded-[5px]" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <defs>
                  <radialGradient id="instagram-grad" cx="30%" cy="107%" r="130%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="5%" stopColor="#fdf497" />
                    <stop offset="45%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="90%" stopColor="#285AEB" />
                  </radialGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#instagram-grad)" />
                <rect x="5" y="5" width="14" height="14" rx="3.5" ry="3.5" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="16.5" cy="7.5" r="0.8" fill="#ffffff" />
              </svg>
            </a>
            <a href="https://twitter.com/PeriyarVarsity" target="_blank" rel="noreferrer" className="px-[2px]">
              <img src="/dept/twitter.png" height="25" width="35" title="Twitter" alt="Twitter" className="h-[20px] md:h-[25px] w-auto" />
            </a>
            <a href="https://www.youtube.com/channel/UCJqVMMa81Cnmu3LdLpsKXYw" target="_blank" rel="noreferrer" className="px-[2px]">
              <img src="/dept/youtube.png" height="40" width="45" title="Youtube" alt="Youtube" className="h-[30px] md:h-[40px] w-auto" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
