import "./styles/main.scss";
import "./styles/tab.scss";
import "./styles/project.scss";
import "./styles/login.scss";

import { Login } from "./components/login";
import { ProjectList } from "./components/project-list";
import { ProjectInput } from "./components/project-input";

new Login();
new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
