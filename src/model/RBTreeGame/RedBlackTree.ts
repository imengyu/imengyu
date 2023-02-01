import { EventEmitter } from "@/utils/EventEmitter";

/**
 * 红黑树
 */
export class RedBlackTree extends EventEmitter {
  /**
   * 根
   */
  public root : RedBlackTreeNode|null = null;
  /**
   * 链表
   */
  public allNodes : RedBlackTreeNode|null = null;

  private addToAllNodes(node: RedBlackTreeNode) {
    node.next = this.allNodes;
    if (node.next)
      node.next.prev = node
    this.allNodes = node;
    node.prev = null;
  }
  private removeFromAllNodes(node: RedBlackTreeNode) {
    if (node.prev)
      node.prev.next = node.next;
    if (node.next)
      node.next.prev = node.prev;
    if (node === this.allNodes)
      this.allNodes = node.next;
    node.prev = null;
    node.next = null;
  }

  /**
   * 红黑树是一种含有红黑结点并能自平衡的二叉查找树。它必须满足下面性质：

      性质1：每个节点要么是黑色，要么是红色。
      性质2：根节点是黑色。
      性质3：每个叶子节点（NIL）是黑色。
      性质4：每个红色结点的两个子结点一定都是黑色。
      性质5：任意一结点到每个叶子结点的路径都包含数量相同的黑结点
   */

  /**
   * 按节点node左旋
   * @param node 
   */
  private rotateLeft(node: RedBlackTreeNode) {
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
      throw new Error('node ' + node.value + ' has no right child, can\'t rotateLeft');
    }
  }
  /**
   * 按节点node右旋
   * @param node 
   */
  private rotateRight(node: RedBlackTreeNode) {
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
      throw new Error('node ' + node.value + ' has no left child, can\'t rotateRight');
    }
  }
  /**
   * 交换两个节点数据
   * @param node1 
   * @param node2 
   */
  private exchangeNodeValue(node1: RedBlackTreeNode, node2: RedBlackTreeNode) {
    const v1 = node1.value;
    node1.value = node2.value;
    node2.value = v1;
  }
  /**
   * 交换两个节点颜色
   * @param node1 
   * @param node2 
   */
  private exchangeNodeColor(node1: RedBlackTreeNode, node2: RedBlackTreeNode) {
    const v1 = node1.isBlack;
    node1.isBlack = node2.isBlack;
    node2.isBlack = v1;
  }

  /**
   * 标记快照
   */
  private emitGenSnapShot(type: 'small'|'rotate'|'finish', mark: string) {
    this.emit('genSnapshot', type, mark);
  }
  /**
   * 标记快照
   */
  private markNode(node: RedBlackTreeNode, mark: 'N'|'P'|'GP'|'B'|'BL'|'BR'|'U'|'UL'|'UR') {
    node.graphMark = mark;
  }

  /**
   * 插入
   * @param val 
   */
  public insert(val: number) : void {
    const newNode = new RedBlackTreeNode();
    newNode.value = val;
    newNode.isBlack = false; //新节点红色
    this.addToAllNodes(newNode);

    //情形1，根节点
    if (this.root === null) {
      this.root = newNode; 
      newNode.isBlack = true;//根黑色

      this.markNode(newNode, 'N')
      this.emitGenSnapShot('finish', `[insert] root = ${val}`);
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

          this.markNode(currFind, 'P');
          this.markNode(newNode, 'N');
          this.emitGenSnapShot('small', `[insert] ${currFind.value}.left = ${val}`);

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

          this.markNode(currFind, 'P');
          this.markNode(newNode, 'N');
          this.emitGenSnapShot('small', `[insert] P(${currFind.value}).right = N(${val})`);

          currFind = null;//停止循环
        }
      } else {
        //插入情景2：插入结点的Key已存在
        console.log('[RedBlackTree] Duplicate element ' + val + ' , ignore');
        return;
      }
    }

    const balanceNode = (node: RedBlackTreeNode) => {
      this.markNode(node, 'N');

      //插入情景1：红黑树为空树
      if (node === this.root) {
        node.isBlack = true;

        this.emitGenSnapShot('finish', `[balanceNode:1:${node.value}] ${node.value}->black`);
        return;
      }
      if (node.parent == null)
        throw new Error('node parent is null but not root!' + node);
      //获取父级
      const parent = node.parent as RedBlackTreeNode;
      if (parent.isBlack) {
        //插入情景3：插入结点的父结点为黑结点
        //由于插入的结点是红色的，并不会影响红黑树的平衡，直接插入即可，无需做自平衡。

        this.emitGenSnapShot('finish', `[balanceNode:3:${node.value}] finish`);
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

        this.markNode(uncle, 'U');
        this.markNode(parent, 'P');
        this.markNode(grandpa, 'GP');
        this.emitGenSnapShot('small', `[balanceNode:4.1:${node.value}] u:${uncle.value}->black p:${parent.value}->black gp:${grandpa.value}->red`);
        
        balanceNode(grandpa); //递归平衡祖父
      } else {
        if (grandpa.isRight(parent)) {
          //插入情景4.3：叔叔结点不存在或为黑结点，并且插入结点的父亲结点是祖父结点的右子结点
          //插入情景4.3.1：插入结点是其父结点的右子结点
          if (parent.isRight(node)) {
            parent.isBlack = true;
            grandpa.isBlack = false;
            this.rotateLeft(grandpa);

            this.markNode(grandpa, 'GP');
            this.markNode(parent, 'P');
            this.emitGenSnapShot('rotate', `[balanceNode:4.3.1:${node.value}] p:${parent.value}->black gp:${grandpa.value}->ref rotateLeft(gp:${grandpa.value})`);
          } 
          //插入情景4.3.2：插入结点是其父结点的左子结点
          else if (parent.isLeft(node)) {
            this.rotateRight(parent);

            this.markNode(parent, 'P');
            this.emitGenSnapShot('rotate', `[balanceNode:4.3.2:${node.value}] rotateRight(p:${parent.value})`);

            balanceNode(parent);
          }
        } else {
          //插入情景4.2：叔叔结点不存在或为黑结点
          //插入情景4.2.1：插入结点是其父结点的左子结点
          if (parent.isLeft(node)) {
            parent.isBlack = true;
            grandpa.isBlack = false;
            this.rotateRight(grandpa);

            this.markNode(parent, 'P');
            this.markNode(grandpa, 'GP');
            this.emitGenSnapShot('rotate', `[balanceNode:4.2.1:${node.value}] p:${parent.value}->black gp:${grandpa.value}->red rotateRight(gp:${grandpa.value})`);
          } 
          //插入情景4.2.2：插入结点是其父结点的右子结点
          else if (parent.isRight(node)) {
            this.rotateLeft(parent);

            this.markNode(parent, 'P');
            this.emitGenSnapShot('rotate', `[balanceNode:4.2.2:${node.value}] rotateLeft(p:${parent.value})`);
            
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
      const TAG = (s: string) => `[delete.doDeleteNode:${s}:${deleteNode.value}]`;
      const parent = deleteNode.parent;
      //情景1：若删除结点无子结点
      if (deleteNode.left === null && deleteNode.right === null) {
        if (deleteNode.isBlack) {
          //删除节点如果为黑色，则需要进行删除平衡的操作
          doBalanceNode(deleteNode);
          deleteNode.removeParentLink();
          this.removeFromAllNodes(deleteNode);

          this.emitGenSnapShot('small', `${TAG('1.1')} finish`);
        } else {
          //删除节点如果为红色，直接删除即可，不会影响黑色节点的数量；
          deleteNode.removeParentLink();
          this.removeFromAllNodes(deleteNode);

          this.emitGenSnapShot('small', `${TAG('1.2')} finish`);
        }
      } 
      //情景2：删除结点只有一个子节点时，删除节点只能是黑色，其子节点为红色，
      //否则无法满足红黑树的性质了。 此时用删除节点的子节点接到父节点，且将子节点颜色涂黑，保证黑色数量。
      else if (
        (deleteNode.left === null && deleteNode.right !== null)
        || (deleteNode.left !== null && deleteNode.right === null)
      ) {
        const childNode = deleteNode.left ? deleteNode.left : deleteNode.right as RedBlackTreeNode;
        deleteNode.removeParentLink();
        this.removeFromAllNodes(deleteNode);

        if (parent) {
          parent.isLeft(deleteNode) ? 
            parent.setLeftChild(childNode) :
            parent.setRightChild(childNode);
        } else {
          this.root = childNode;
          childNode.removeParentLink();
        }

        //涂黑
        childNode.isBlack = true;
        
        this.emitGenSnapShot('small', `${TAG('2')} finish`);
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
        
        //交换后继节点
        this.exchangeNodeValue(deleteNode, currFind);
        
        this.emitGenSnapShot('small', `${TAG('3')} exchangeNodeValue(d:${deleteNode.value}, r:${currFind.value}) finish`);
        
        //情形转至为1或2处理
        doDeleteNode(currFind);
      }
    }
    const doBalanceNode = (node: RedBlackTreeNode) => {
      const TAG = (s: string) => `[delete.doBalanceNode:${s}:${node.value}]`;

      //情形1 当前节点为根节点（父节点为NULL）
      if (node === this.root) {
        this.root = null;
        return;
      }
      
      const parent = node.parent as RedBlackTreeNode;
      const brother = (parent.isLeft(node) ? parent.right : parent.left) as RedBlackTreeNode;

      if (brother.isBlack) 
      {
        //情形2 兄弟节点为黑色
        if (brother.isAllChildBlack()) {
          //情形2.1 兄弟的子节点全黑
          //兄弟节点的子节点全为黑色，也就意味着兄弟节点（S）可以涂红而不会和子冲突。
          //S涂红后，也就实现了子平衡，
          //这时候我们看父节点是红是黑，再做处理。
          if (parent.isBlack) {
            //情形2.1.1 父节点为黑色
            //此时将S涂红，父节点作为新的平衡节点N，递归上去处理。
            brother.isBlack = false;

            this.emitGenSnapShot('small', `${TAG('2.1.1')} b:${brother.value}->red`);

            doBalanceNode(parent);
          } else {
            //情形2.1.2 父节点为红色
            //此时将S涂红，P涂黑，平衡结束。
            brother.isBlack = false;
            parent.isBlack = true;

            this.emitGenSnapShot('finish', `${TAG('2.1.2')} b:${brother.value}->red p:${parent.value}->black`);
          }
        } else {
          //情形2.2 兄弟的子节点不全黑
          if (parent.isLeft(brother) && (brother.left && !brother.left.isBlack)) {
            //情形2.2.1 S为左子，SL红；S为右子，SR红
            //以P为支点右旋；交换P和S颜色，SL涂黑；平衡结束。
            const borderLeft = brother.left;
            this.rotateRight(parent);

            this.emitGenSnapShot('small', `${TAG('2.2.1')} rotateRight(p:${parent.value})`);

            this.exchangeNodeColor(parent, brother);
            borderLeft.isBlack = true;

            this.emitGenSnapShot('finish', `${TAG('2.2.1')} exchangeNodeColor(p:${parent.value}, b:${brother.value}) bl:${borderLeft.prev}->black`);
          }
          else if (parent.isRight(brother) && (brother.right && !brother.right.isBlack)) {
            //对称的情形(2)：S为黑色，S为右子，SR红时：
            //以P为支点左旋；交换P和S颜色（S涂为P原颜色，P涂黑），SR涂黑；平衡结束。
            const borderRight = brother.right;
            this.rotateLeft(parent);
              
            this.emitGenSnapShot('small', `${TAG('2.2.1.2')} rotateLeft(p:${parent.value})`);

            this.exchangeNodeColor(parent, brother);
            borderRight.isBlack = true;

            this.emitGenSnapShot('finish', `${TAG('2.2.1.2')} exchangeNodeColor(p:${parent.value}, b:${brother.value}) br:${borderRight.prev}->black`);
          }
          else if (parent.isLeft(brother) && (!brother.left || brother.left.isBlack)) {
            //情形2.2.2 S为左子，SL黑；S为右子，SR黑
            //以S为支点左旋，交换S和SR颜色（SR涂黑，S涂红） ，此时转至情形2.2.1-(1) S左-SL红 进行处理。
            const borderRight = brother.right;
            this.rotateLeft(brother);
            brother.isBlack = false;
            if (borderRight)
              borderRight.isBlack = true;

            this.emitGenSnapShot('small', `${TAG('2.2.2')} rotateLeft(b:${brother.value}) b:${brother.value}->red br:${borderRight?.value || 'null'}->black`);

            doBalanceNode(node);
          }
          else if (parent.isRight(brother) && (!brother.right || brother.right.isBlack)) {
            //对称的情形(2) S为黑色，S为右子，SR黑
            //以S为支点右旋，交换S和SL颜色（SL涂黑，S涂红），此时转至2.2.1-(1) S右-SR红进行处理。
            const borderLeft = brother.left;
            this.rotateRight(brother);
            brother.isBlack = false;
            if (borderLeft)
              borderLeft.isBlack = true;

            this.emitGenSnapShot('small', `${TAG('2.2.2.2')} rotateRight(b:${brother.value}) b:${brother.value}->red bl:${borderLeft?.value || 'null'}->black`);

            doBalanceNode(node);
          }
        }
      } 
      else 
      {
        //情形3 兄弟节点为红色
        if (parent.isLeft(brother)) {
          this.rotateRight(parent);
          this.exchangeNodeColor(parent, brother);
    
          this.emitGenSnapShot('small', `${TAG('3.1')} rotateRight(p:${parent.value}) exchangeNodeColor(p:${parent.value}, b:${brother.value})`);

          doBalanceNode(node);
        } else if (parent.isRight(brother)) {
          this.rotateLeft(parent);
          this.exchangeNodeColor(parent, brother);

          this.emitGenSnapShot('small', `${TAG('3.2')} rotateLeft(p:${parent.value}) exchangeNodeColor(p:${parent.value}, b:${brother.value})`);

          doBalanceNode(node);
        }
      }
    };
    
    //查找删除节点
    const node = this.findNode(val);
    if (node)
      doDeleteNode(node);
    else
      console.log('Delete not found', val);
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

  public isMark = false;
  public graphMark = '';


  /**
   * 用于链表
   */
  public next : RedBlackTreeNode|null = null;
  /**
   * 用于链表
   */
  public prev : RedBlackTreeNode|null = null;

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
   * 检查两个子节点是不是全黑
   */
  public isAllChildBlack() {
    return (
      (this.left && this.right && this.left.isBlack && this.right.isBlack)
      || (this.right === null && this.left && this.left.isBlack)
      || (this.left === null && this.right && this.right.isBlack)
      || (this.left === null && this.right === null)
    );
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