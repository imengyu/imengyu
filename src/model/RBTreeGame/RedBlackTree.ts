import { assert } from "@vue/compiler-core";
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
   * 红色节点的子节点必须是黑色（不能出现相连红色节点）。
   * 从节点（包括根）到其任何后代NULL节点(叶子结点下方挂的两个空节点，并且认为他们是黑色的)的每条路径都具有相同数量的黑色节点。
   */

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
    } else {
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
          //重复的节点，忽略
          console.warn('Duplicate element ' + val + ' , ignore');
          return;
        }
      }

      const balanceNode = (node: RedBlackTreeNode) => {
        //如果是根节点，返回，不做操作
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
          //情形2. 父节点为黑色时，无需其他操作，已然平衡
          return;
        } else {
          const grandpa = parent.parent as RedBlackTreeNode;
          const uncle = (grandpa.left === parent ? grandpa.right : grandpa.left) as RedBlackTreeNode; //获取父亲的兄弟节点
          
          if (uncle && uncle.isBlack) { 
            //情况4, 父亲是红色，叔叔也是黑色，需要平衡

            //情形4.1 父节点和N在同一边
            if (parent === grandpa.left && node === parent.left) {
              //情形4.1.1 父N同左
              //“父N同左”指的是：父节点为祖父节点的左子，N为父节点的左子。
              //此时以祖父节点(GP)为支点进行右旋；然后将P涂黑，将GP涂红。

              //代码操作步骤 p挂载到gp的父级，gp挂到p右子，如果之前p有右子，则挂载到gp左子

              const greatGrandfather = grandpa.parent;
              if (greatGrandfather) {
                //检查下原先挂载的是左子还是右子
                const childPos = greatGrandfather.checkIsChild(grandpa);
                if (childPos === -1)
                  greatGrandfather.setLeftChild(parent);
                else if (childPos === 1)
                  greatGrandfather.setRightChild(parent);
              } else {
                this.root = parent;
                parent.isBlack = true;
                parent.parent = null;
              }

              parent.isBlack = true;//涂黑

              //如果p之前有右子，则挂载到gp左子
              const oldParentRight = parent.right;
              if (oldParentRight)
                grandpa.setLeftChild(oldParentRight);
              else
                grandpa.left = null; //清空之前的连接

              //gp挂到p右子
              parent.setRightChild(grandpa);

              grandpa.isBlack = false; //GP涂红
            }
            else if (parent === grandpa.right && node === parent.right) {
              //情形4.1.2 父N同右
              //4.1.1 的镜像版
              //此时以祖父节点(GP)为支点进行左旋；将P涂黑，将GP涂红。

              //代码操作步骤 p挂载到gp的父级，gp挂到p左子，如果之前p有左子，则挂载到gp右子

              const greatGrandfather = grandpa.parent;
              if (greatGrandfather) {
                //检查下原先挂载的是左子还是右子
                const childPos = greatGrandfather.checkIsChild(grandpa);
                if (childPos === -1)
                  greatGrandfather.setLeftChild(parent);
                else if (childPos === 1)
                  greatGrandfather.setRightChild(parent);
              } else {
                this.root = parent;
                parent.isBlack = true;
                parent.parent = null;
              }

              parent.isBlack = true;//涂黑

              //如果p之前有左子，则挂载到gp右子
              const oldParentLeft = parent.left;
              if (oldParentLeft)
                grandpa.setRightChild(oldParentLeft);
              else
                grandpa.right = null; //清空之前的连接

              //gp挂到p左子
              parent.setLeftChild(grandpa);

              grandpa.isBlack = false; //GP涂红
            }
            //情形4.2 父节点和N不在同一边
            else if (parent === grandpa.left && node === parent.right) {
              //情形4.2.1 父左N右
              //“父左N右”指的是：父节点是祖父节点的左子，N为父节点的右子。
              //此时，以父节点(P)进行左旋，旋转后，以P作为新的平衡节点N，转至 [情形4.1.1 父N同左] 处理。

              //代码操作步骤 n挂载到gp的左子，p成为n左子，然后递归对p节点进行平衡

              grandpa.setLeftChild(node);
              node.setLeftChild(parent);
              parent.right = null; //置空

              balanceNode(parent);
            }
            else if (parent === grandpa.right && node === parent.left) {
              //情形4.2.2 父右N左
              // “父右N左”指的是：父节点是祖父节点的右子，N为父节点的左子。
              // 此时，以父节点(P)进行右旋，旋转后，以P作为新的平衡节点，此时再进行【情形4.1.2 父N同右】处理。

              grandpa.setRightChild(node);
              node.setRightChild(parent);
              parent.left = null; //置空

              balanceNode(parent);
            }
          } else {
            //情况3, 父亲是红色，叔叔也是红色, 或者压根没有叔叔，则递归，为父叔涂黑色，祖父红色
            if (uncle)
              uncle.isBlack = true;
            parent.isBlack = true;
            grandpa.isBlack = false;
            balanceNode(grandpa); //递归平衡祖父
          }
        }
      };

      //平衡这个节点
      balanceNode(newNode);
    }
  }
  /**
   * 删除
   * @param val 
   */
  public delete(val: number) : void {
    //TODO: 删除
    console.log('delete ' + val);
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
   * 设置当前节点的左子
   * @param left 
   */
  public setLeftChild(left : RedBlackTreeNode) : void {
    this.left = left;
    this.left.parent = this;
  }
  /**
   * 设置当前节点的右子
   * @param right 
   */
  public setRightChild(right : RedBlackTreeNode) : void {
    this.right = right;
    this.right.parent = this;
  }
}