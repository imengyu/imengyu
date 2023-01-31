import { RedBlackTreeGameNodeData } from "./RedBlackTreeGame";

/**
 * 红黑树
 */
export class RedBlackTree {
  /**
   * 根
   */
  public root : RedBlackTreeNode|null = null;


  /**
   * 根黑色，NULL节点黑色。
   *
   * 
   * 红黑树是一种含有红黑结点并能自平衡的二叉查找树。它必须满足下面性质：

      性质1：每个节点要么是黑色，要么是红色。
      性质2：根节点是黑色。
      性质3：每个叶子节点（NIL）是黑色。
      性质4：每个红色结点的两个子结点一定都是黑色。
      性质5：任意一结点到每个叶子结点的路径都包含数量相同的黑结点
   * 
   * 
   */

  /**
   * 按节点node左旋
   * @param node 
   */
  rotateLeft(node: RedBlackTreeNode) {
    const parent = node.parent as RedBlackTreeNode;
    const right = node.right as RedBlackTreeNode;
    if (right) {
      const rightLeft = right.left;

      if (parent) {
        const childPos = parent.checkIsChild(node);
        if (childPos === -1)
          parent.setLeftChild(right);
        else if (childPos === 1)
          parent.setRightChild(right);
      } else {
        this.root = right;
        right.removeParentLink();
      }

      right.setLeftChild(node);
      node.setRightChild(rightLeft)
    } else {
      console.log('node ', node.value , ' has no right child, can\'t rotateLeft');
    }
  }
  /**
   * 按节点node右旋
   * @param node 
   */
  rotateRight(node: RedBlackTreeNode) {
    const parent = node.parent as RedBlackTreeNode;
    const left = node.left as RedBlackTreeNode;
    if (left) {
      const leftRight = left.right;

      if (parent) {
        const childPos = parent.checkIsChild(node);
        if (childPos === -1)
          parent.setLeftChild(left);
        else if (childPos === 1)
          parent.setRightChild(left);
      } else {
        this.root = left;
        left.removeParentLink();
      }
      
      left.setRightChild(node);
      node.setLeftChild(leftRight);
    } else {
      console.log('node ', node.value , ' has no left child, can\'t rotateRight');
    }
  }
  /**
   * 交换两个节点数据
   * @param node1 
   * @param node2 
   */
  exchangeNode(node1: RedBlackTreeNode, node2: RedBlackTreeNode) {
    const v1 = node1.value;
    node1.value = node2.value;
    node2.value = v1;
  }

  /**
   * 插入
   * @param val 
   */
  public insert(val: number) : void {
    const newNode = new RedBlackTreeNode();
    newNode.value = val;
    newNode.isBlack = false; //新节点红色

    //情形1，根节点
    if (this.root === null) {
      this.root = newNode; 
      newNode.isBlack = true;//根黑色
      return;
    } 
    
    //二分查找，以找到插入位置
    let currFind : RedBlackTreeNode|null = this.root;
    while(currFind) {
      if (val < currFind.value) {
        //左侧
        if (currFind.left) {
          //左边有孩子，继续在左边查找
          currFind = currFind.left; 
        }
        else {
          //就在当前节点插入
          currFind.setLeftChild(newNode);
          currFind = null;//停止循环
        }
      } else if (val > currFind.value) {
        //右侧
        if (currFind.right) {
          //右边有孩子，继续在右边查找
          currFind = currFind.right; 
        }
        else {
          //就在当前节点插入
          currFind.setRightChild(newNode);
          currFind = null;//停止循环
        }
      } else {
        //插入情景2：插入结点的Key已存在
        console.log('[RedBlackTree] Duplicate element ' + val + ' , ignore');
        return;
      }
    }

    const balanceNode = (node: RedBlackTreeNode) => {
      //插入情景1：红黑树为空树
      if (node === this.root) {
        node.isBlack = true;
        return;
      }
      if (node.parent == null) {
        console.error('node parent is null but not root!', node);
        return;
      }
      //获取父级
      const parent = node.parent as RedBlackTreeNode;
      if (parent.isBlack) {
        //插入情景3：插入结点的父结点为黑结点
        //由于插入的结点是红色的，并不会影响红黑树的平衡，直接插入即可，无需做自平衡。
        return;
      } 

      //插入情景4：插入结点的父结点为红结点
      const grandpa = parent.parent as RedBlackTreeNode;
      const parentIsLeft = grandpa.left === parent;
      const uncle = (parentIsLeft ? grandpa.right : grandpa.left) as RedBlackTreeNode; //获取父亲的兄弟节点
      
      if (uncle && !uncle.isBlack) {
        //插入情景4.1：叔叔结点存在并且为红结点
        uncle.isBlack = true;
        parent.isBlack = true;
        grandpa.isBlack = false;
        balanceNode(grandpa); //递归平衡祖父
      } else {
        if (grandpa.isRight(parent)) {
          //插入情景4.3：叔叔结点不存在或为黑结点，并且插入结点的父亲结点是祖父结点的右子结点
          //插入情景4.3.1：插入结点是其父结点的右子结点
          if (parent.isRight(node)) {
            parent.isBlack = true;
            grandpa.isBlack = false;
            this.rotateLeft(grandpa);
          } 
          //插入情景4.3.2：插入结点是其父结点的左子结点
          else if (parent.isLeft(node)) {
            this.rotateRight(parent);
            balanceNode(parent);
          }
        } else {
          //插入情景4.2：叔叔结点不存在或为黑结点
          //插入情景4.2.1：插入结点是其父结点的左子结点
          if (parent.isLeft(node)) {
            parent.isBlack = true;
            grandpa.isBlack = false;
            this.rotateRight(grandpa);
          } 
          //插入情景4.2.2：插入结点是其父结点的右子结点
          else if (parent.isRight(node)) {
            this.rotateLeft(parent);
            balanceNode(parent);
          }
        }
      }
    };

    //平衡这个节点
    balanceNode(newNode);
  }

  /**
   * 查找节点
   * @param val 
   */
  public findNode(val: number) {
    let currFind : RedBlackTreeNode|null = this.root;
    while(currFind) {
      if (val < currFind.value) {
        //左侧
        currFind = currFind.left;
      } else if (val > currFind.value) {
        //右侧
        currFind = currFind.right; 
      } else {
        return currFind;
      }
    }
    return null;
  }

  /**
   * 删除
   * @param val 
   */
  public delete(val: number) : void {
    const doDeleteNode = (deleteNode: RedBlackTreeNode) => {
      const parent = deleteNode.parent;
      //情景1：若删除结点无子结点
      if (deleteNode.left === null && deleteNode.right === null) {
        if (deleteNode.isBlack) {
          //删除节点如果为黑色，则需要进行删除平衡的操作

        } else {
          //删除节点如果为红色，直接删除即可，不会影响黑色节点的数量；
          deleteNode.removeParentLink();
        }
      } 
      //情景2：删除结点只有一个子节点时，删除节点只能是黑色，其子节点为红色，
      //否则无法满足红黑树的性质了。 此时用删除节点的子节点接到父节点，且将子节点颜色涂黑，保证黑色数量。
      else if (
        (deleteNode.left === null && deleteNode.right !== null)
        || (deleteNode.left !== null && deleteNode.right === null)
      ) {
        const childNode = deleteNode.left ? deleteNode.left : deleteNode.right as RedBlackTreeNode;
        this.exchangeNode(deleteNode, childNode);
        doDeleteNode(childNode);
      }
      //情景3：有两个子节点时，与二叉搜索树一样，使用后继节点作为替换的
      //删除节点，情形转至为1或2处理。
      else if (deleteNode.left !== null && deleteNode.right !== null) {
        //查找后继节点，这里寻找右后继节点
        let currFind = deleteNode.right;
        while(currFind) {
          if (currFind.left)
            currFind = currFind.left;
          else 
            break;
        }

        if (currFind) {

        }

      }
    }
    
    //查找删除节点
    const node = this.findNode(val);
    if (node)
      doDeleteNode(node);
  }
}

/**
 * 节点
 */
export class RedBlackTreeNode {
  /**
   * 黑色？
   */
  public isBlack = false;
  /**
   * 父级
   */
  public parent : RedBlackTreeNode|null = null;
  /**
   * 左子
   */
  public left : RedBlackTreeNode|null = null;
  /**
   * 右子
   */
  public right : RedBlackTreeNode|null = null;
  /**
   * 数值
   */
  public value = 0;
  /**
   * 图表中渲染所需数据
   */
  public gameData = new RedBlackTreeGameNodeData();

  /**
   * 检查某个节点是不是当前节点的子级，是左子则返回-1，右子返回1，非子返回0.
   * @param node 节点
   * @returns 
   */
  public checkIsChild(node : RedBlackTreeNode) : -1|0|1 {
    if (node === this.left)
      return -1;
    if (node === this.right)
      return 1;
    return 0;
  }
  /**
   * 检查某个节点是不是当前节点的左子
   * @param node 节点
   * @returns 
   */
  public isLeft(node : RedBlackTreeNode) : boolean {
    return (node === this.left);
  }
  /**
   * 检查某个节点是不是当前节点的右子
   * @param node 节点
   * @returns 
   */
  public isRight(node : RedBlackTreeNode) : boolean {
    return (node === this.right);
  }
  /**
   * 清除父级节点连接
   */
  public removeParentLink() {
    if (this.parent) {
      if (this.parent.isLeft(this))
        this.parent.left = null;
      if (this.parent.isRight(this))
        this.parent.right = null;
      this.parent = null;
    }
  }
  /**
   * 设置当前节点的左子
   * @param left 
   */
  public setLeftChild(left : RedBlackTreeNode|null) : void {
    console.assert(left != this, 'Left child can not be it self!');

    left?.removeParentLink();
    this.left = left;
    if (this.left)
      this.left.parent = this;
  }
  /**
   * 设置当前节点的右子
   * @param right 
   */
  public setRightChild(right : RedBlackTreeNode|null) : void {
    console.assert(right != this, 'Right child can not be it self!');

    right?.removeParentLink();
    this.right = right;
    if (this.right)
      this.right.parent = this;
  }
}