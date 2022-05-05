import { v4 as uuidv4 } from "uuid";
import { Project, ProjectStatus } from "../models/project";

type Listener<T> = (items: T[]) => void;
class State<T> {
  // NOTE:protected修飾子を使うと継承先のクラスでもプロパティにアクセスすることができる
  protected listeners: Listener<T>[] = [];
  // NOTE:レンダリングのタイミングでproject-list.jsのprojectState.addListenersが発火しコールバック関数がlisteners変数にプッシュされる
  // NOTE:project-list.jsで別に宣言している関数はここで呼べないため切り出している（責務が異なるため）
  // NOTE:addProjectやmoveProjectが発火するたびにコールバック関数にprojectを引数に入れて発火する（けどproject-list.jsの関数も使える）
  addListeners(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}
export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState; // 静的プロパティ（クラスプロパティ）
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      // NOTE:静的メソッドから静的プロパティにアクセスするときはthisを使う＞同じクラスを参照しているため
      return this.instance;
    }
    this.instance = new ProjectState(); // NOTE:インスタンス化させる
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
    this.updateListners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      // NOTE:project.status !== newStatusを追加することで不要な再描画を防止できる（同じ要素でDDしても発火しない）
      project.status = newStatus;
      this.updateListners();
    }
  }

  private updateListners() {
    // NOTE:index.tdで2個インスタンスを作っているのでthis.listersには2個値が入っている（"実行中プロジェクト"と"完了プロジェクト"）
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
      // NOTE:listenersは関数の参照なのでsliceを使ってコピーを渡す（外部から追加できないようにするため）
    }
  }
}

// 状態管理を行うオブジェクトはアプリケーション全体で必ず一つだけ存在するようにしたい＞シングルトンパターン（インスタンスが一つしか存在しないことを保証する）で保証する
// private constructorでシングルトンのクラスであることを保証する＞何を？＞「いつでも一つのインスタンスしか存在しない」こと
// projectStateのグローバルなオブジェクトの定数を作成する＞getInstanceから取得している
export const projectState = ProjectState.getInstance();

// NOTE:Q, 複数のファイルでインポートされているが、これは複数実行されるのか？
// NOTE:A, 一度だけしか実行されない
