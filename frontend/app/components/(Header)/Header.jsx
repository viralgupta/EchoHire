import Link from "next/link";
import AvatarMain from "./Avatar";


const Header = () => {
  return (
    <header className="flex h-16 w-full flex-row items-center justify-between border-b border-border bg-background p-5 opacity-90">
      <div className="flex flex-row justify-around gap-3">
        <Link href={'/'} className="font-sans text-3xl font-bold text-foreground">
          echohire.com
        </Link>
      </div>
      <AvatarMain />
    </header>
  );
};

export default Header;
