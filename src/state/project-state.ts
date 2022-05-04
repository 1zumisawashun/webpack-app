import { v4 as uuidv4 } from "uuid";
import { Project, ProjectStatus } from "../models/project";

type Listener<T> = (items: T[]) => void;
class State<T> {
  // 継承先のクラスでもアクセスすることができる
  protected listeners: Listener<T>[] = []; //関数の配列

  // addProjectでitemが入ることを前提に考える
  // addProject,moveProjectでsらにラップされていることに注意
  // オブザーバーパターンであることに注意
  addListeners(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
    console.log(this.listeners, "addListners");
  }
}

// project state management
// シングルトンとして切り出す理由として各オブジェクトをインスタンス化してもリストの追加に関しては使い回しで十分だからか？
// 流石にtitleとかdecsに関しては毎回にインスタンスを生成する必要はあるが。

export class ProjectState extends State<Project> {
  // renderProjectsの関数が入る
  // シングルトン（インスタンスが一つしか存在しないことを保証する）でprojectsを使い回すことができる
  // 使い回す=状態を保つ
  private projects: Project[] = [];
  // アプリケーション全体で必ず一つのオブジェクトしか存在しないことを保証する
  // 静的プロパティ（クラスプロパティ）
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  // 新しいオブジェクトを利用することを保証できる
  // 静的プロパティにアクセスするときはthisを使う＞同じクラスを参照しているため
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    // インスタンス化させる
    this.instance = new ProjectState();
    return this.instance;
  }

  // CASE1:押下した時にリストに追加される・最終的にupdateListnersを発火させる
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
  // CASE2:DDした時にリストに追加される・最終的にupdateListnersを発火させる
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      //project.status !== newStatusを追加することで不要な再描画を防止できる（同じ要素でDDしても発火しない）
      project.status = newStatus;
      // リスナーは何か変更した時だけ呼び出す。リスナー関数が実行されると一覧が全て再描画される
      this.updateListners();
    }
  }

  private updateListners() {
    // listersは絶対に２個（"実行中プロジェクト" : "完了プロジェクト"）
    for (const listenerFn of this.listeners) {
      console.log(this.listeners, "listner");
      console.log(this.projects, "this.projects");
      listenerFn(this.projects.slice());
      // 追加される旅にprojectsを引数にしたコールバック関数が叩かれる
      //でここで全部定義していないのはrenderContentの責務をここで定義支度ないため
      // (projects: Project[]) => {
      //   console.log(projects, "========");
      //   const relevantProject = projects.filter((prj) => {
      //     if (this.type === "active") {
      //       return prj.status === ProjectStatus.Active;
      //     }
      //     return prj.status === ProjectStatus.Finished;
      //   });
      //   this.assignedProjects = relevantProject;
      //   console.log(this.assignedProjects, "this.assignedProjects");
      //   this.renderProjects();
      // }
      // リスナーは関数の参照なので
      // sliceを使ってコピーを渡す。外部から追加できないようにするため
    }
  }
}

// 状態管理を行うオブジェクトはアプリケーション全体で必ず一つだけ存在するようにしたい＞シングルトンパターンで保証する
// private constructorでシングルトンのクラスであることを保証する＞「いつでも一つのインスタンスしか存在しない」こと
// projectStateのグローバルなオブジェクトの定数を作成する＞getInstanceから取得している
export const projectState = ProjectState.getInstance();

// NOTE:Q, 複数のファイルでインポートされているが、これは複数実行されるのか？
// NOTE:A, 一度だけしか実行されない
