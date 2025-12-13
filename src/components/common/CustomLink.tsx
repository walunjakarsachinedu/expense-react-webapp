import { Link } from "react-router-dom";

type Props = {
  to: string;
  children: string;
};
function CustomLink({ to, children }: Props) {
  return (
    <Link
      to={to}
      className="text-primary-500 hover:text-primary-300 hover:no-underline transition-colors"
    >
      {children}
    </Link>
  );
}

export default CustomLink;
