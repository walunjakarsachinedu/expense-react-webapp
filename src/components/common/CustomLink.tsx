import { Link } from "react-router-dom";

type Props = {
  to: string;
  children: string;
};
function CustomLink({ to, children }: Props) {
  return (
    <Link
      to={to}
      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
    >
      {children}
    </Link>
  );
}

export default CustomLink;
