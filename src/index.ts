import "./styles/main.scss";
import "./styles/tab.scss";
import "./styles/project.scss";

import "./login";
import { ProjectList } from "./components/project-list";
import { ProjectInput } from "./components/project-input";

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
