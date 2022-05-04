import * as React from "react";
import Body from "./Body";
import Nav from "./Nav";

export interface ILayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<ILayoutProps> = (props) => {
  return (
    <div>
      <Nav />
      <Body>{props.children}</Body>
    </div>
  );
};
export default Layout;
