import MathUtils from "@/utils/MathUtils";
import { CanvasGameProvider } from "../CanvasGameProvider";
import { RedBlackTree, RedBlackTreeNode } from "./RedBlackTree";



export class RedBlackTreeGame extends CanvasGameProvider {

  constructor() {
    super();
    this.tree.on('genSnapshot', () => {
      this.generateNewTreeSnapshot();
    });
  }

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
  private treeSnapshotCurrent = null as TreeSnapshot|null;

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
      snapshotNode.isBlack = node.isBlack;
      snapshotNode.gameData.color = node.isBlack ? 0 : 255;
      snapshotNode.gameData.opacity = 0;
      snapshotNode.gameData.generateHeight = height;
      snapshotNode.gameData.generateAllHeight = allHeight;

      if (parent) {
        //按左右生成坐标
        const selfPos = node.parent?.checkIsChild(node) || 0;
        if (selfPos === -1)
          snapshotNode.gameData.generatePositionX = parent.gameData.generatePositionX - widthNow;
        else if (selfPos === 1)
          snapshotNode.gameData.generatePositionX = parent.gameData.generatePositionX + widthNow;
        snapshotNode.gameData.generatePositionY = parent.gameData.generatePositionY + (1 / allHeight);
      } else {
        //根节点
        snapshotNode.gameData.generatePositionX = 0;
        snapshotNode.gameData.generatePositionY = 0;
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
    if (this.treeSnapshotCurrent) {
      this.renderTreeNode(this.treeSnapshotCurrent.root, null);
    }
  }
  private renderTreeNode(node : TreeSnapshotNode|null, parentPos: {x: number, y: number }|null) {
    const ctx = this.ctx as CanvasRenderingContext2D ;
    const w2 = this.width / 2;
    const h2 = this.height / 2;
    if (node) {
      const nodeRealpos = {
        x: w2 + w2 * node.gameData.generatePositionX,
        y: h2 / 2 + h2 * node.gameData.generatePositionY,
      }

      if (parentPos) {
        ctx.beginPath();
        ctx.moveTo(parentPos.x, parentPos.y);
        ctx.lineTo(nodeRealpos.x, nodeRealpos.y);
        ctx.stroke();
      }
      
      if (node.left)
        this.renderTreeNode(node.left, nodeRealpos);
      if (node.right)
        this.renderTreeNode(node.right, nodeRealpos);

      ctx.fillStyle = `rgb(${node.gameData.color},0,0)`;

      ctx.beginPath();        //开始绘制新路径 
      ctx.arc(nodeRealpos.x, nodeRealpos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#fff'
      ctx.fillText(node.value.toString(), nodeRealpos.x, nodeRealpos.y + 4, 10);

    }
  }

  //对当前与下一个快照做比对，以得出修改过的节点
  private diffTreeSnapshot(current: TreeSnapshot, next: TreeSnapshot) {

    const addToChangedList = (node : TreeSnapshotNode) => {
      node.next = current.changedNodes;
      current.changedNodes = node;
    };

    const loopNode = (node : TreeSnapshotNode) => {
      const nextNode = this.findTreeSnapshot(next.root, node.value);
      if (nextNode) {
        let changed = false;
        if (node.isBlack !== nextNode.isBlack) {
          node.gameData.targetColor = nextNode.isBlack ? 0 : 255;
          changed = true;
        }
        if (node.gameData.generatePositionX !== nextNode.gameData.generatePositionX) {
          node.gameData.targetPositionX = nextNode.gameData.generatePositionX;
          changed = true;
        }
        if (node.gameData.generatePositionY !== nextNode.gameData.generatePositionY) {
          node.gameData.targetPositionY = nextNode.gameData.generatePositionY;
          changed = true;
        }

        if (changed) {
          node.gameData.action = 'transition';
          addToChangedList(node);
        } else {
          node.gameData.action = 'none';
        }

      } else {
        //下一帧没有，则表示当前节点移除
        node.gameData.action = 'removing';
      }

      if (node.left) loopNode(node.left);
      if (node.right) loopNode(node.right);
    }

    //循环一次当前快照，得出已经变换位置或者颜色的节点、将要移除的节点
    loopNode(current.root);
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
    const FADE_TRANS_TIME = 1;
    const MOVE_TRANS_SPEED = 1;
    const COLOR_TRANS_SPEED = 255;
    if (this.treeSnapshotCurrent && this.treeSnapshotCurrent) {
      let node = this.treeSnapshotCurrent.changedNodes;
      while (node) {
        const gameData = node.gameData;
        switch (gameData.action) {
          case 'adding': {
            if (gameData.opacity < 1)
              gameData.opacity += deltatime * FADE_TRANS_TIME;
            break;
          }
          case 'removing': {
            if (gameData.opacity > 0)
              gameData.opacity -= deltatime * FADE_TRANS_TIME;
            break;
          }
          case 'transition': { 
            if (gameData.targetColor !== null) {
              if (gameData.color < gameData.targetColor) {
                gameData.color += Math.floor(deltatime * COLOR_TRANS_SPEED);
              } else if (gameData.color > gameData.targetColor) {
                gameData.color -= Math.floor(deltatime * COLOR_TRANS_SPEED);
              } 
            }
            
            if (gameData.targetPositionX !== null) {
              if (gameData.generatePositionX < gameData.targetPositionX) {
                gameData.generatePositionX = Math.min(gameData.targetPositionX, gameData.generatePositionX + deltatime * MOVE_TRANS_SPEED);
              } else if (gameData.generatePositionX > gameData.targetPositionX) {
                gameData.generatePositionX = Math.max(gameData.targetPositionX, gameData.generatePositionX - deltatime * MOVE_TRANS_SPEED);
              } else {
                gameData.targetPositionX = null;
              }
            }
            
            if (gameData.targetPositionY !== null) {
              if (gameData.generatePositionY < gameData.targetPositionY) {
                gameData.generatePositionY = Math.min(gameData.targetPositionY, gameData.generatePositionY + deltatime * MOVE_TRANS_SPEED);
              } else if (gameData.generatePositionY > gameData.targetPositionY) {
                gameData.generatePositionY = Math.max(gameData.targetPositionY, gameData.generatePositionY - deltatime * MOVE_TRANS_SPEED);
              } else {
                gameData.targetPositionY = null;
              }
            }
            break;
          }
        }
        node = node.next;
      }
    }
  }
  //执行快照切换
  private runSnapShot(deltatime : number) {
    if (this.treeSnapshots.length > 1) {
      if (this.treeSnapshotCurrent) {
        this.treeSnapshotCurrent.timeLive -= deltatime;
        if (this.treeSnapshotCurrent.timeLive <= 0) {
          this.treeSnapshots.shift();
          this.treeSnapshotCurrent = this.treeSnapshots[0];
        }
      } else {
        this.treeSnapshots.shift()
        this.treeSnapshotCurrent = this.treeSnapshots[0];
      }
    }
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
    this.runSnapShot(deltatime);
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
  public constructor(root : TreeSnapshotNode, timeLive = 2) {
    this.root = root;
    this.timeLive = timeLive;
  }

  public root : TreeSnapshotNode;
  public timeLive : number;
  public changedNodes : TreeSnapshotNode|null = null;
}
export class TreeSnapshotNode {
  public gameData = new RedBlackTreeGameNodeData();
  public value = 0;
  public isBlack = false;

  public left : TreeSnapshotNode|null = null;
  public right : TreeSnapshotNode|null = null;

  public prev : TreeSnapshotNode|null = null;
  public next : TreeSnapshotNode|null = null;
}
export class RedBlackTreeGameNodeData {
  generatePositionX = 0;
  generatePositionY = 0;
  generateAllHeight = 0;
  generateHeight = 0;

  action = 'adding' as 'none'|'transition'|'removing'|'adding';
  opacity = 1;
  color = 1;

  targetPositionX = null as null|number;
  targetPositionY = null as null|number;
  targetColor = null as null|number;
}

