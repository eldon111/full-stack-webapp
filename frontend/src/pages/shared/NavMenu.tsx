import '../App.css'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu.tsx";

function NavMenu() {
    return (
        <NavigationMenu>
            <NavigationMenuItem className={navigationMenuTriggerStyle()}>
                <NavigationMenuLink href="/">Images</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className={navigationMenuTriggerStyle()}>
                <NavigationMenuLink href="/upload">Upload</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className={navigationMenuTriggerStyle()}>
                <NavigationMenuLink href="/login">Log In</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem className={navigationMenuTriggerStyle()}>
                <NavigationMenuLink href="/logout">Log Out</NavigationMenuLink>
            </NavigationMenuItem>

            {/*<NavigationMenuIndicator></NavigationMenuIndicator>*/}
        </NavigationMenu>
)
}

export default NavMenu
