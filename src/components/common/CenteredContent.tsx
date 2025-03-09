import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
function CenteredContent({ children }: Props) {
  return (
    <div className="flex justify-content-center align-items-center flex-wrap">
      <div className="col-12 md:col-10" style={{ maxWidth: 1000 }}>
        {children}
      </div>
    </div>
  );
}

export default CenteredContent;
