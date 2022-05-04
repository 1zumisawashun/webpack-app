import { Component } from "./base-component";
import { autobind } from "../decorators/autobind";
import { Project, ProjectStatus } from "../models/project";
import { DragTarget } from "../models/drag-drop";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  // implementを追加したことで特定のメソッドを追加することを強制される
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    // superの呼び出しが完了するまではthisを使うことができないのでthis.type>typeにする
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];
    // 依存関係の不具合が発生する可能性があるのでabstractには書かなかった
    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      // event.preventDefault();を追加することでjavaScriptではこれによってDDだけが許可される
      // これを指定しないとdropHandlerが呼び出されない
      // 結論ドロップを許可するために設置する
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    console.log(event);
    // ブラウザでconsole.logのデータを見ている時には既にデータがクリアされているためItemやTypesを見ることはできない
    // オブジェクトはreference型なので最新の状態が表示されるのが原因。下記で確認できる
    console.log(event.dataTransfer!.getData("text/plain"));
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  //abstractで実装しているから記述が必要＞何もすることがなければそのままにしておく
  // publicメソッドはprivateメソッドの上に設置する
  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    // 監視するだけ、初期レンダーはrenderContentでやっている、addProject or moveProjectで
    // 発火する＞連動しているからか
    // 味噌は「切り出した関数を別のクラスで使うこと」である
    // mountのタイミングで下記を発火させコールバック関数をStateクラスのlistnersに入れる
    // 登録するだけ！＞関数の設置を行っている動的に変化させる、責務の切り分けのためにクラスを分けている
    projectState.addListeners((projects: Project[]) => {
      console.log(projects, "========");
      const relevantProject = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProject;
      console.log(this.assignedProjects, "this.assignedProjects");
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
      new ProjectItem(listEl.id, prjItem);
    }
  }
}
