import { Inter, Lato } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({ subsets: ["latin"] });

export const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const kensonSans = localFont({
  src: [
    {
      path: "../../public/fonts/Kelson Sans Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Kelson Sans Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});
