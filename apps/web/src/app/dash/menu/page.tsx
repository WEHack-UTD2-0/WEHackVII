// import Menu from "@/app/sections/Menu/Menu";

export const dynamic = "force-dynamic";

export default async function page() {
    return(
        <div className="px-5 pb-40">

          <h1 className="mx-auto mt-20 w-full lg:px-24 text-5xl md:text-6xl font-black pb-10">Menu</h1>
          {/* add text that says menu can be found on Hacker Pack or on the main website! */}
          <p className="text-center text-lg mt-4">
            You can find the menu on the Hacker Pack!
          </p>
    </div>
    );
}