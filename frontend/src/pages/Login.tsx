import {Button} from "@/components/ui/button.tsx";

export default function Login() {

  return (
    <div className="flex flex-col min-h-svh">
      <form action={`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/login/google`} method="get">
        <Button type="submit">Login with Google</Button>
      </form>
    </div>
  )
}