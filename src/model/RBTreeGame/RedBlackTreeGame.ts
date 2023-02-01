import MathUtils from "@/utils/MathUtils";
import { CanvasGameProvider } from "../CanvasGameProvider";
import { RedBlackTree, RedBlackTreeNode } from "./RedBlackTree";



export class RedBlackTreeGame extends CanvasGameProvider {

  constructor() {
    super();
    this.tree.on('genSnapshot', (type: string, mark: string) => {
      this.generateNewTreeSnapshot(type, mark);
    });
    this.treeSnapshots.push(new TreeSnapshot(null, 'first', 'Empty State'));
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
  private generateNewTreeSnapshot(type: string, mark: string) {
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
      snapshotNode.gameData.nodeMark = node.graphMark; node.graphMark = '';
      snapshotNode.gameData.nodeMarkCur = node.graphMarkCur; node.graphMarkCur = 0;
      snapshotNode.gameData.color = node.isBlack ? 0 : 255;
      snapshotNode.gameData.opacity = 1;
      snapshotNode.gameData.generateHeight = height;
      snapshotNode.gameData.generateAllHeight = allHeight;

      node.isMark = true;

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
    const loopAddAllNodeToLinkedList = (snapshot: TreeSnapshot, node: TreeSnapshotNode) => {
      snapshot.addToAllNodesLinkedList(node);
      if (node.left)
        loopAddAllNodeToLinkedList(snapshot, node.left);
      if (node.right)
        loopAddAllNodeToLinkedList(snapshot, node.right);
    };

    const root = this.tree.root;
    if (root) {
      //循环节点，标记所有节点为没有访问状态
      let node : RedBlackTreeNode|null = root;
      while(node) {
        node.isMark = false;
        node = node.next;
      }

      //首先需要计算树的高度，以供图标绘制坐标计算
      const height = getTreeHeight(root);
      const snapshot = new TreeSnapshot(
        genNode(height, height, 0.6, root, null),
        type,
        mark,
      );

      //循环添加所有的节点至链表中
      if (snapshot.root)
        loopAddAllNodeToLinkedList(snapshot, snapshot.root);

      this.treeSnapshots.push(snapshot);

      if (this.treeSnapshots.length > 1) {
        //循环节点，找出没有访问状态的孤立节点，重新添加到列表中
        node = root;
        while(node) {
          if (!node.isMark) {
            //查找孤立节点是否在前一帧有数据，有则复制数据，否则丢弃
            const prevSnapShotNode = this.findTreeSnapshotAllNodes(
              this.treeSnapshots[this.treeSnapshots.length - 2].allNodes, 
              node.value
            );
            if (prevSnapShotNode) {
              //复制数据并加入链表
              const snapshotNode = new TreeSnapshotNode();
              snapshotNode.value = prevSnapShotNode.value;
              snapshotNode.isBlack = prevSnapShotNode.isBlack;
              snapshotNode.gameData = prevSnapShotNode.gameData;
              snapshot.addToAllNodesLinkedList(snapshotNode);
            }

          }
          node = node.next;
        }
      }
    }

    this.emitSnapshotIndexChange();
  }

  //渲染树
  private renderTreeMap() {
    if (this.treeSnapshotCurrent) {
      this.renderTreeNode(this.treeSnapshotCurrent.root, null);
      if (this.ctx) {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#333'
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.treeSnapshotCurrent.mark, this.width / 2,60);
      }
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
      const mark = node.gameData.nodeMark;
      const nodeMarkCur = node.gameData.nodeMarkCur;

      ctx.globalAlpha = 1;
      
      if (node.left)
        this.renderTreeNode(node.left, nodeRealpos);
      if (node.right)
        this.renderTreeNode(node.right, nodeRealpos);

      ctx.globalAlpha = node.gameData.opacity;
      ctx.strokeStyle = '#000';

      if (parentPos) {
        ctx.beginPath();
        ctx.moveTo(parentPos.x, parentPos.y);
        ctx.lineTo(nodeRealpos.x, nodeRealpos.y);
        ctx.stroke();
      }

      ctx.lineWidth = 2;
      ctx.font = '13px Arail';
      ctx.fillStyle = `rgb(${node.gameData.color},0,0)`;
      ctx.strokeStyle = '#000';
      ctx.beginPath();
      ctx.arc(nodeRealpos.x, nodeRealpos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#fff'
      ctx.fillText(node.value.toString(), nodeRealpos.x, nodeRealpos.y + 4, 10);

      if (mark) {
        if (nodeMarkCur === 1) {
          ctx.strokeStyle = '#f60';
          ctx.beginPath();
          ctx.arc(nodeRealpos.x, nodeRealpos.y, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
        else if (nodeMarkCur === 2) {
          ctx.strokeStyle = '#26a';
          ctx.beginPath();
          ctx.arc(nodeRealpos.x, nodeRealpos.y, 14, Math.PI, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(nodeRealpos.x - 12,nodeRealpos.y);
          ctx.lineTo(nodeRealpos.x - 16,nodeRealpos.y);
          ctx.lineTo(nodeRealpos.x - 14,nodeRealpos.y + 3);
          ctx.closePath();
          ctx.stroke();
        }
        else if (nodeMarkCur === 3) {
          ctx.strokeStyle = '#26a';
          ctx.beginPath();
          ctx.arc(nodeRealpos.x, nodeRealpos.y, 14, Math.PI, Math.PI * 2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(nodeRealpos.x + 12,nodeRealpos.y);
          ctx.lineTo(nodeRealpos.x + 16,nodeRealpos.y);
          ctx.lineTo(nodeRealpos.x + 14,nodeRealpos.y + 3);
          ctx.closePath();
          ctx.stroke();
        }
        else if (nodeMarkCur === 4) {
          ctx.strokeStyle = '#000';
          ctx.beginPath();
          ctx.arc(nodeRealpos.x, nodeRealpos.y, 14, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.font = 'bold 15px Arail';
        ctx.fillStyle = '#000';
        ctx.fillText(mark, nodeRealpos.x + 30, nodeRealpos.y + 5);
      }
    }
  }

  //对当前与下一个快照做比对，以得出修改过的节点
  private diffTreeSnapshot(prev: TreeSnapshot, current: TreeSnapshot, next: TreeSnapshot|null) {
    //循环一次当前快照，得出已经变换位置或者颜色的节点、将要移除的节点
    let currNode : TreeSnapshotNode|null = current.allNodes;
    while(currNode) {
      const prevNode = this.findTreeSnapshotAllNodes(prev.allNodes, currNode.value);
      const nextNode = next ? this.findTreeSnapshotAllNodes(next.allNodes, currNode.value) : currNode;
      if (prevNode) {
        let changed = false;
        if (currNode.isBlack !== prevNode.isBlack) {
          currNode.gameData.color = prevNode.gameData.color;
          currNode.gameData.targetColor = currNode.isBlack ? 0 : 255;
          changed = true;
        }
        if (currNode.gameData.generatePositionX !== prevNode.gameData.generatePositionX) {
          currNode.gameData.targetPositionX = currNode.gameData.generatePositionX;
          currNode.gameData.generatePositionX = prevNode.gameData.generatePositionX;
          changed = true;
        }
        if (currNode.gameData.generatePositionY !== prevNode.gameData.generatePositionY) {
          currNode.gameData.targetPositionY = currNode.gameData.generatePositionY;
          currNode.gameData.generatePositionY = prevNode.gameData.generatePositionY;
          changed = true;
        }

        if (changed) {
          currNode.gameData.action = nextNode ? 'transition' : 'removing';
          current.addToChangedNodesLinkedList(currNode);
        } else { 
          if (!nextNode) {
            //下一帧没有，则表示当前节点正在被移除
            currNode.gameData.action = 'removing';
            currNode.gameData.opacity = 0;
            current.addToChangedNodesLinkedList(currNode);
          } else {
            currNode.gameData.action = 'none';
            currNode.gameData.opacity = 1;
          }
        }
      } else {
        //上一帧没有，则表示当前节点是新增的
        currNode.gameData.action = 'adding';
        currNode.gameData.opacity = 0;
        current.addToChangedNodesLinkedList(currNode);
      }
      currNode = currNode.next2;
    }

    current.isDiffPatched = true;
  }
  //查找快照树指定节点
  private findTreeSnapshotAllNodes(root: TreeSnapshotNode|null, value : number) {
    let currNode : TreeSnapshotNode|null = root;
    while(currNode) {
      if (value === currNode.value)
        return currNode;
      currNode = currNode.next2;
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
        if (gameData.action !== 'none') {

          if (gameData.action === 'adding') {
            if (gameData.opacity < 1)
              gameData.opacity = Math.min(1, gameData.opacity + deltatime * FADE_TRANS_TIME);
          } else if (gameData.action === 'removing') {
            if (gameData.opacity > 0)
              gameData.opacity = Math.max(0, gameData.opacity - deltatime * FADE_TRANS_TIME);
          }

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
        }
        node = node.next;
      }
    }
  }

  public enableAutoRunSnapShot = false;
  public snapshotIndex = 0;

  //执行快照切换
  private runSnapShot(deltatime : number) {
    if (this.enableAutoRunSnapShot && this.snapshotIndex < this.treeSnapshots.length - 1) {
      if (this.treeSnapshotCurrent) {
        this.treeSnapshotCurrent.timeLive -= deltatime;
        if (this.treeSnapshotCurrent.timeLive <= 0)
          this.nextSnapShot();
      } else
        this.nextSnapShot();
    }
  }

  //下一帧
  public nextSnapShot() {
    if (this.snapshotIndex < this.treeSnapshots.length - 1) {
      this.snapshotIndex++;

      if (!this.treeSnapshots[this.snapshotIndex].isDiffPatched) {
        //与上一个快照帧做比较
        this.diffTreeSnapshot(
          this.treeSnapshots[this.snapshotIndex - 1],
          this.treeSnapshots[this.snapshotIndex],
          this.treeSnapshots[this.snapshotIndex + 1] || null,
        );
      }

      this.treeSnapshotCurrent = this.treeSnapshots[this.snapshotIndex];
      this.emitSnapshotIndexChange();
    }
  }
  //上一帧
  public prevSnapShot() {
    if (this.snapshotIndex > 0) {
      this.snapshotIndex--;
      this.treeSnapshotCurrent = this.treeSnapshots[this.snapshotIndex];
      this.emitSnapshotIndexChange();
    }
  }

  //生成一次循环帧数据
  public genDataPage() {
    this.pushData(2);
    this.pushData(1);
    this.pushData(3);
    this.deleteData(1);
    this.deleteData(2);
    //for (let i = 0; i < 16; i++) 
    //  Math.random() > 0.7 ? this.pushData() : this.deleteData();
  }

  private emitSnapshotIndexChange() {
    this.emit('snapshotIndexChange', this.snapshotIndex, this.treeSnapshots.length - 1);
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
    this.genDataPage();
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
  public constructor(root : TreeSnapshotNode|null, type: string, mark: string, timeLive = 2) {
    this.root = root;
    this.type = type;
    this.mark = mark;
    this.timeLive = timeLive;
  }
  public type: string;
  public mark: string;
  public root : TreeSnapshotNode|null;
  public timeLive : number;
  public isDiffPatched = false;
  /**
   * next
   */
  public changedNodes : TreeSnapshotNode|null = null;
  /**
   * next2
   */
  public allNodes : TreeSnapshotNode|null = null;

  public addToChangedNodesLinkedList(node: TreeSnapshotNode) {
    node.next = this.changedNodes;
    this.changedNodes = node;
  }
  public addToAllNodesLinkedList(node: TreeSnapshotNode) {
    node.next2 = this.allNodes;
    this.allNodes = node;
  }
}
export class TreeSnapshotNode {
  public gameData = new RedBlackTreeGameNodeData();
  public value = 0;
  public isBlack = false;

  public left : TreeSnapshotNode|null = null;
  public right : TreeSnapshotNode|null = null;

  public next : TreeSnapshotNode|null = null;
  public next2 : TreeSnapshotNode|null = null;
}
export class RedBlackTreeGameNodeData {
  generatePositionX = 0;
  generatePositionY = 0;
  generateAllHeight = 0;
  generateHeight = 0;

  action = 'none' as 'none'|'transition'|'removing'|'adding';
  opacity = 1;
  color = 1;
  nodeMark = '';
  /*
  0 none 
  1 cur 
  2 rotate left cur 
  3 rotate right cur
  4 delete cur
  */
  nodeMarkCur = 0;

  targetPositionX = null as null|number;
  targetPositionY = null as null|number;
  targetColor = null as null|number;
}

