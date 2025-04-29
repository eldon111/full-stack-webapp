import '../App.css';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu.tsx';

function NavMenu() {
  return (
    <NavigationMenu className="mb-5">
      <NavigationMenuList className="gap-6">
        <NavigationMenuItem>
          <NavigationMenuLink className="bg-gray-50" href="/">
            Images
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className="bg-gray-50" href="/upload">
            Upload
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className="bg-gray-50" href="/login">
            Log In
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className="bg-gray-50" href={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/logout`}>
            Log Out
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default NavMenu;
