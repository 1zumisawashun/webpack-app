import { Component } from "./base-component";
import { autobind } from "../decorators/autobind";
import { Project, ProjectStatus } from "../models/project";
import { DragTarget } from "../models/drag-drop";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";
export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  // NOTE:implementを追加したことで特定のメソッドを追加することを強制される
  // NOTE:interfaceはオブジェクトの構造を型として定義するだけではなく、クラスに対する契約として使うことができる（implement）
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    // NOTE:superの呼び出しが完了するまではthisを使うことができないので「this.type」>「type]にする
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      // NOTE:event.preventDefault();を追加することでjavaScriptではこれによってDDだけが許可される
      // NOTE:これを指定しないとdropHandlerが呼び出されない
      // NOTE:結論ドロップを許可するためにevent.preventDefault();を設置する
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    console.log(event);
    console.log(event.dataTransfer!.getData("text/plain"));
    // NOTE:ブラウザでconsole.logのデータを見ている時には既にデータがクリアされているためeventのItemやTypesを見ることはできない
    // NOTE:オブジェクトはreference型なので最新の状態が表示されるのが原因なのでevent.dataTransfer!.getData("text/plain")で確認できる
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

  // NOTE:abstractクラスを景勝しているので実装がなくても記述が必要＞何もすることがなければそのままにしておく
  // NOTE:「publicメソッド」は「privateメソッド」の上に設置する
  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    // NOTE:責務上別のクラスに切り出している関数を持ってきてaddEventListnerと同じように「登録」している
    // NOTE:詳細はproject-state.jsに記載されている
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
    listEl.innerHTML = ""; // NOTE:初期化する
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(listEl.id, prjItem);
    }
  }
}
