import MathUtils from "@/utils/MathUtils";
import { CanvasGameProvider } from "../CanvasGameProvider";
import { RedBlackTree, RedBlackTreeNode } from "./RedBlackTree";



export class RedBlackTreeGame extends CanvasGameProvider {

  private width = 0;
  private height = 0;

  //主树
  private tree = new RedBlackTree();
  //树中不允许出现重复键值，因此采用数据池，随机取出数据
  private treeDataPool = [] as number[];
  private treeDataPoolSize = 64;//数据个数
  private addedDataPool = [] as number[];

  private debugNextDelData = 0;
  private debugNextAddData = 0;

  private getDebugNextData() {
    let randIndex = MathUtils.randomNum(0, this.treeDataPool.length - 2);
    this.debugNextAddData = this.treeDataPool[randIndex];
    randIndex = MathUtils.randomNum(0, this.addedDataPool.length - 2);
    this.debugNextDelData = this.addedDataPool[randIndex];
    this.emit('debugNextDataChanged', this.debugNextAddData, this.debugNextDelData)
  }

  //生成数据
  private genData() {
    let data = 0;
    for (let i = 0; i < this.treeDataPoolSize; i++) {
      data += Math.random() > 0.5 ? 1 : 2;
      this.treeDataPool[i] = data;
    }
  }
  private pushData(data?: number) : void {
    let dataIndex = 0;
    if (data) {
      dataIndex = this.treeDataPool.indexOf(data);
    } else {
      dataIndex = MathUtils.randomNum(0, this.treeDataPool.length - 2);
      data = this.treeDataPool[dataIndex];
    }
    this.tree.insert(data);
    this.treeDataPool.splice(dataIndex, 1);
    this.addedDataPool.push(data);
  }
  private deleteData(data?: number) : void {
    let dataIndex = 0;
    if (data) {
      dataIndex = this.addedDataPool.indexOf(data);
    } else {
      dataIndex = MathUtils.randomNum(0, this.addedDataPool.length - 2);
      data = this.addedDataPool[dataIndex];
    }
    this.tree.delete(data);
    this.treeDataPool.push(data);
    this.addedDataPool.slice(dataIndex, 1);
  }

  debugPushData() : void {
    this.pushData(this.debugNextAddData);
    this.getDebugNextData();
  }
  debugDeleteData(value: string|number) : void {
    this.debugNextDelData = typeof value === 'string' ? parseInt(value) : value;
    this.deleteData(this.debugNextDelData);
    this.getDebugNextData();
  }

  //节点控制函数
  //=============================================

  //树的变化快照
  private treeSnapshots = [] as TreeSnapshot[];
  private treeSnapshotCurrent = null as TreeSnapshotNode|null;

  //生成快照
  private generateNewTreeSnapshot() {
    const getTreeHeight = (node : RedBlackTreeNode|null) => {
      if (node) {
        const height = 1;
        let l = 0, r = 0;
        if (node.left) 
          l = getTreeHeight(node.left);
        if (node.right) 
          r = getTreeHeight(node.right);

        return height + (l > r ? l : r);
      }
      return 0;
    }; 
    const genNode = (height: number, allHeight: number, widthNow: number, node : RedBlackTreeNode, parent: TreeSnapshotNode|null) => {
      
      const snapshotNode = new TreeSnapshotNode();
      snapshotNode.value = node.value;
      snapshotNode.gameData.generateHeight = height;
      snapshotNode.gameData.generateAllHeight = allHeight;

      if (parent) {
        //按左右生成坐标
        const selfPos = node.parent?.checkIsChild(node) || 0;
        if (selfPos === -1)
          snapshotNode.gameData.generatePosition.x = parent.gameData.generatePosition.x - widthNow;
        else if (selfPos === 1)
          snapshotNode.gameData.generatePosition.x = parent.gameData.generatePosition.x + widthNow;
        snapshotNode.gameData.generatePosition.y = parent.gameData.generatePosition.y + (1 / allHeight);
      } else {
        //根节点
        snapshotNode.gameData.generatePosition.x = 0;
        snapshotNode.gameData.generatePosition.y = 0;
      }

      //递归生成子级
      if (node.left)
        snapshotNode.left = genNode(height - 1, allHeight, widthNow / 2, node.left, snapshotNode);
      if (node.right)
        snapshotNode.right = genNode(height - 1, allHeight, widthNow / 2, node.right, snapshotNode);

      return snapshotNode;
    };

    const root = this.tree.root;
    if (root) {
      //首先需要计算树的高度，以供图标绘制坐标计算
      const height = getTreeHeight(root);
      const snapshot = new TreeSnapshot(genNode(height, height, 0.6, root, null));
      if (this.treeSnapshots.length > 0)
        //与上一个快照帧做比较
        this.diffTreeSnapshot(
          this.treeSnapshots[this.treeSnapshots.length - 1],
          snapshot,
        );
      this.treeSnapshots.push(snapshot);
    }
  }

  //渲染树
  private renderTreeMap() {
    const ctx = this.ctx as CanvasRenderingContext2D ;
    const w2 = this.width / 2;
    const h2 = this.height / 2;

    const renderNode = (node : TreeSnapshotNode|null, parentPos: {x: number, y: number }|null) => {
      if (node) {
        const nodeRealpos = {
          x: w2 + w2 * node.gameData.generatePosition.x,
          y: h2 / 2 + h2 * node.gameData.generatePosition.y,
        }

        if (parentPos) {
          ctx.beginPath();
          ctx.moveTo(parentPos.x, parentPos.y);
          ctx.lineTo(nodeRealpos.x, nodeRealpos.y);
          ctx.stroke();
        }
        
        if (node.left)
          renderNode(node.left, nodeRealpos);
        if (node.right)
          renderNode(node.right, nodeRealpos);

        if (node.isBlack) 
          ctx.fillStyle = '#000'
        else
          ctx.fillStyle = '#f00'

        ctx.beginPath();        //开始绘制新路径 
        ctx.arc(nodeRealpos.x, nodeRealpos.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff'
        ctx.fillText(node.value.toString(), nodeRealpos.x, nodeRealpos.y + 4, 10);

      }
    }; 

    renderNode(this.treeSnapshotCurrent, null);
  }

  //对当前与下一个快照做比对，以得出修改过的节点
  private diffTreeSnapshot(current: TreeSnapshot, next: TreeSnapshot) {
    const loopNode = (node : TreeSnapshotNode) => {
      const nextNode = this.findTreeSnapshot(next.root, node.value);
      if (nextNode) {
        node.gameData.action = 'transition';
        if (node.isBlack !== nextNode.isBlack) {
          
        }

      } else {
        //下一帧没有，则表示当前节点移除
        node.gameData.action = 'removing';
      }

    }
    if (this.treeSnapshotCurrent && this.treeSnapshotCurrent)
      loopNode(this.treeSnapshotCurrent);
  }
  //查找快照树指定节点
  private findTreeSnapshot(root: TreeSnapshotNode, value : number) {
    let currFind : TreeSnapshotNode|null = root;
    while(currFind) {
      if (value < currFind.value) {
        //左侧
        currFind = currFind.left;
      } else if (value > currFind.value) {
        //右侧
        currFind = currFind.right; 
      } else {
        return currFind;
      }
    }
    return null;
  }
  //执行树的动画
  private updateTreeAction(deltatime : number) {


    const loopNode = (node : TreeSnapshotNode) => {
      const nextNode = this.findTreeSnapshot(node, );


    }
    if (this.treeSnapshotCurrent && this.treeSnapshotCurrent)
      loopNode(this.treeSnapshotCurrent);
  }

  //基础控制函数
  //=============================================

  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) : void {
    this.ctx = ctx;
    this.ctx.strokeStyle = '1px solid #000';
    this.ctx.textAlign = 'center';
    this.ctx.font = '13px Arail';
    this.canvas = canvas;
    this.genData();
    for (let i = 0; i < 16; i++)
      this.pushData();
    this.getDebugNextData();
  }
  public destroy() : void {
    console.log('[RedBlackTreeGame] destroy');
  }
  public render(deltatime : number) : void {
    this.renderTreeMap();
    this.updateTreeAction(deltatime);
  }
  public start() : void {
    console.log('[RedBlackTreeGame] start');
  }
  public stop() : void {
    console.log('[RedBlackTreeGame] stop');
  }
  public resize(w : number, h: number) : void {
    this.width = w;
    this.height = h;
  }
}

export class TreeSnapshot {
  public constructor(root : TreeSnapshotNode) {
    this.root = root;
  }

  public root : TreeSnapshotNode;
  public changedNodes : TreeSnapshotNode|null = null;
}
export class TreeSnapshotNode {
  public gameData = new RedBlackTreeGameNodeData();
  public left : TreeSnapshotNode|null = null;
  public right : TreeSnapshotNode|null = null;
  public next : TreeSnapshotNode|null = null;
  public value = 0;
  public isBlack = false;
}
export class RedBlackTreeGameNodeData {
  generatePosition = { x: 0, y: 0 };
  generateAllHeight = 0;
  generateHeight = 0;

  action = 'none' as 'none'|'transition'|'removing'|'adding';
  opacity = 1;
  color = 1;

  targetPosition = { x: 0, y: 0 };
  targetOpacity = 1;
  targetColor = 0;
}

