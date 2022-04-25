import { v4 as uuidv4 } from "uuid";
import "./styles/main.scss";
import loginIcon from "./assets/login.svg";
import { formData } from "./forms";

// NOTE:エクスクラメーション（!）でnullを回避する
const loginImg = document.getElementById("loginImg")!;
(loginImg as HTMLInputElement).src = loginIcon;
console.log(uuidv4());
console.log("hello world");

// NOTE:index.jsの出力なら問題ないがjsファイルは読み込むことができない
const form = document.querySelector("form")!;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = formData(form);
  console.log(data, "data");
});

enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}
type Listener<T> = (items: T[]) => void;
class State<T> {
  // 継承先のクラスでもアクセスすることができる
  protected listeners: Listener<T>[] = []; //関数の配列

  addListeners(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// project state management
// シングルトンとして切り出す理由として各オブジェクトをインスタンス化してもリストの追加に関しては使い回しで十分だからか？
// 流石にtitleとかdecsに関しては毎回にインスタンスを生成する必要はあるが。
class ProjectState extends State<Project> {
  // renderProjectsの関数が入る

  private projects: Project[] = [];
  // アプリケーション全体で必ず一つのオブジェクトしか存在しないことを保証する
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  // 新しいオブジェクトを利用することを保証できる
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, manday: number) {
    const newProject = new Project(
      uuidv4(),
      title,
      description,
      manday,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
      // sliceを使ってコピーを渡す。外部から追加できないようにするため
    }
  }
}

// 状態管理を行うオブジェクトはアプリケーション全体で必ず一つだけ存在するようにしたい＞シングルトンパターンで保証する
// private constructorでシングルトンのクラスであることを保証する＞「いつでも一つのインスタンスしか存在しない」こと
// projectStateのグローバルなオブジェクトの定数を作成する＞getInstanceから取得している
const projectState = ProjectState.getInstance();

// validate
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// autobind decorator
// "noUnusedParameters": trueをfalseにするか_をつける
// 再利用のためにデコレータを使う？
function autobind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Component Class
// Angulerとかでは見かけられるクラスっぽい
// 直接インスタンス化されるべきではないので＞常に継承して使われるのでabstractクラスで登録する
// abstractにすることでインスタンスかできなくなる
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId: string //任意のパラメータは最後に置く必要がある
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    // templateElement.contentでchildrenを取得することができる
    // 第二引数でディープクローンするか選択する（children以下の階層のNodeも取得するか）
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  // abstractメソッドは具体的な実装はありません。代わりにこのクラスを継承したクラスで、このメソッドを実装して
  // 利用可能にすることを強制します＞具体的な実装内容は継承先のクラスでおこなう
  abstract configure(): void;
  abstract renderContent(): void;
  // ここからコンストラクタの中の要素は取得することができない
  // 第一引数はどこに入れるか（インサートするか）
  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    // superの呼び出しが完了するまではthisを使うことができないのでthis.type>typeにする
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];
    // 依存関係の不具合が発生する可能性があるのでabstractには書かなかった
    this.configure();
    this.renderContent();
  }

  //abstractで実装しているから記述が必要＞何もすることがなければそのままにしておく
  // publicメソッドはprivateメソッドの上に設置する
  configure() {
    projectState.addListeners((projects: Project[]) => {
      const relevantProject = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProject;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    ) as HTMLUListElement;
    // 初期化する
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // NOTE:インスタンス変数
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  // インスタンス化される時に即時フォームを表示する
  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
    // privateメソッドなのでクラスの内側でしか呼び出すことができない
  }

  configure() {
    // this.element.addEventListener("submit", this.submitHandler.bind(this));
    // デコレータを使って解決することもできる。以下デコレータを使った場合
    this.element.addEventListener("submit", this.submitHandler);
  }
  renderContent() {}

  // タプル型で定義
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManday = this.mandayInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const mandayValidatable: Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 1000,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(mandayValidatable)
    ) {
      alert("入力値が正しくありません。再度お試しください。");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredManday];
    }
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.mandayInputElement.value = "";
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    // 呼び出し元で.bind(this)することで呼び出し元と同じオブジェクトを参照する
    // このままだと呼び出し元（configure）がthisになる
    const userInput = this.gatherUserInput();
    // ランタイム上ではタプルかどうか確認できないのでArrayかで判断する
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      // シングルトンクラスから読んでいる
      projectState.addProject(title, desc, manday);
      this.clearInput();
    }
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
