import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function CenteredForm({ children }: Props) {
  return (
    <div className="flex flex-column align-items-center justify-content-center mt-8">
      <div className="w-20rem">{children}</div>
    </div>
  );
}

export default CenteredForm;
