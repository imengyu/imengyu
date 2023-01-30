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

  //生成数据
  private genData() {
    let data = 0;
    for (let i = 0; i < this.treeDataPoolSize; i++) {
      data += Math.random() > 0.5 ? 1 : 2;
      this.treeDataPool[i] = data;
    }
  }
  private pushData() : void {
    const randIndex = MathUtils.randomNum(0, this.treeDataPool.length - 2);
    this.tree.insert(this.treeDataPool[randIndex]);
    this.treeDataPool.splice(randIndex, 1);
  }

  debugPushData() : void {
    this.pushData();
    this.generateTreeMapData();
  }

  //节点控制函数
  //=============================================

  //生成树的位置，返回已更改位置的节点
  private generateTreeMapData(root: RedBlackTreeNode|null = null) {

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

    const posChangedNodes = [] as RedBlackTreeNode[];

    const genNode = (height: number, allHeight: number, widthNow: number, node : RedBlackTreeNode|null) => {
      if (node) {
        node.gameData.generateHeight = height;
        node.gameData.generateAllHeight = allHeight;

        const parent = node.parent;
        if (parent) {
          //按左右生成坐标
          const selfPos = parent.checkIsChild(node);
          if (selfPos === -1)
            node.gameData.generatePosition.x = parent.gameData.generatePosition.x - widthNow;
          else if (selfPos === 1)
            node.gameData.generatePosition.x = parent.gameData.generatePosition.x + widthNow;
          node.gameData.generatePosition.y = parent.gameData.generatePosition.y + (1 / allHeight);

          //推入位置变更的节点
          if (node.gameData.isPositionChanged())
            posChangedNodes.push(node);
        } else {
          //根节点
          node.gameData.generatePosition.x = 0;
          node.gameData.generatePosition.y = 0;
        }

        //递归生成子级
        if (node.left)
          genNode(height - 1, allHeight, widthNow / 2, node.left);
        if (node.right)
          genNode(height - 1, allHeight, widthNow / 2, node.right);
      }
    }; 

    if (root === null) {
      //首先需要计算树的高度，以供图标绘制坐标计算
      const height = getTreeHeight(this.tree.root);
      //生成相关位置数据
      this.tree.root!.gameData.generatePosition.x = 0;
      this.tree.root!.gameData.generatePosition.y = 0;
      genNode(height, height, 0.6, this.tree.root);
    } else {
      //生成相关位置数据
      genNode(root.gameData.generateHeight, root.gameData.generateAllHeight, 0.6, root);
    }

    return posChangedNodes;
  }
  //渲染树
  private renderTreeMap() {
    const ctx = this.ctx as CanvasRenderingContext2D ;
    const w2 = this.width / 2;
    const h2 = this.height / 2;

    const renderNode = (node : RedBlackTreeNode|null, parentPos: {x: number, y: number }|null) => {
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

    renderNode(this.tree.root, null);
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
    for (let i = 0; i < 16; i++) {
      this.pushData();
    }
    this.generateTreeMapData();
  }
  public destroy() : void {
    //Base function
  }
  public render(deltatime : number) : void {
    this.renderTreeMap();
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

export class RedBlackTreeGameAnimStepData {
  type: 'none'|'fade'|'pos'|'color' = 'none';
  targetPosition = { x: 0, y: 0 };
  targetOpacity = 1;
  targetColor = 0;
}
export class RedBlackTreeGameNodeData {
  generatePosition = { x: 0, y: 0 };
  generateAllHeight = 0;
  generateHeight = 0;

  isPositionChanged() {
    return this.generatePosition.x != this.position.x || this.generatePosition.y != this.position.y;
  }

  position = { x: 0, y: 0 };
  opacity = 1;
  color = 0;
}

