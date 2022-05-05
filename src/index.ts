import "./assets/sass/main.scss";
import "./assets/sass/tab.scss";
import "./assets/sass/project.scss";
import "./assets/sass/login.scss";

import { Login } from "./components/login";
import { ProjectList } from "./components/project-list";
import { ProjectInput } from "./components/project-input";

new Login();
new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
