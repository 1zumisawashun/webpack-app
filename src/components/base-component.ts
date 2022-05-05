// NOTE:Angulerとかでは見かけられるクラスっぽい
// NOTE:直接インスタンス化されるべきではない＞常に継承して使われるのでabstractクラスで登録する
// NOTE:abstractにすることでインスタンス化できなくなる
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId: string // NOTE:任意のパラメータは最後に置く必要がある
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    // NOTE:templateElement.contentでchildrenを取得することができる
    // NOTE:第二引数でディープクローンするか選択する（children以下の階層のNodeも取得するか）

    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  // NOTE:abstractメソッドは具体的な実装はない。代わりにこのクラスを継承したクラスでこのメソッドを実装して
  // NOTE:利用可能にすることを強制する＞具体的な実装内容は継承先のクラスでおこなう
  abstract configure(): void;
  abstract renderContent(): void;

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
    // NOTE:第一引数はどこに要素を入れるか（インサートするか）決める
  }
}
