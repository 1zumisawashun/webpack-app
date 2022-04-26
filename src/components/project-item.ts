import { Component } from "./base-component";
import { autobind } from "../decorators/autobind";
import { Project } from "../models/project";
import { Draggable } from "../models/drag-drop";
//interfaceはオブジェクトの構造を型として定義するだけではなく、クラスに対する契約として使うことができる（implement）
export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  get manday() {
    if (this.project.manday < 20) {
      return this.project.manday.toString() + "人日";
    } else {
      return (this.project.manday / 20).toString() + "人月";
    }
  }
  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    // thisを使うとクラスから生成されたインスタンスを参照する。生のnameとかだとグローバルな参照になる
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent) {
    console.log("drag終了");
  }

  configure() {
    //イベントリスナーのthisはデフォルトではイベントの対象となったHTML要素を参照する
    //bind(this)を追加することで参照先を変更することができる
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    // computedに似ている！
    // 何らかのデータを取得するときに何か変更を加えたものを取得することができる
    this.element.querySelector("h3")!.textContent = this.manday;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
