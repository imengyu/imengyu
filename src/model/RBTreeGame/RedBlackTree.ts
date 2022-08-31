
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
      let node : RedBlackTreeNode|null = this.root;
      while(node) {
        if (val < node.value) {
          //左侧
          if (node.left) {
            //左边有孩子，继续在左边查找
            node = node.left; 
          }
          else {
            //就在当前节点插入
            node.left = newNode;
            newNode.parent = node;
            node = null;//停止循环
          }
        } else if (val > node.value) {
          //右侧
          if (node.right) {
            //右边有孩子，继续在右边查找
            node = node.right; 
          }
          else {
            //就在当前节点插入
            node.right = newNode;
            newNode.parent = node;
            node = null;//停止循环
          }
        } else {
          throw new Error('Duplicate element ' + val);
        }
      }

      const balanceNode = (node: RedBlackTreeNode) => {
        //根节点在递归中返回，不做操作
        if (node === this.root)
          return;
        //获取父级
        const parent = node.parent as RedBlackTreeNode;
        if (parent.isBlack) {
          //情形2. 父节点为黑色时，无需其他操作，已然平衡
          return;
        } else {
          const grandpa = parent.parent as RedBlackTreeNode;
          const uncle = (grandpa.left === parent ? grandpa.right : grandpa.left) as RedBlackTreeNode; //获取父亲的兄弟节点
          if (uncle.isBlack) { 
            //情况4, 父亲是红色，叔叔也是黑色

            
            if (parent === grandpa.left && node === parent.left) {
              /*
                情形4.1.1 父N同左
                “父N同左”指的是：父节点为祖父节点的左子，N为父节点的左子。
                此时以祖父节点(GP)为支点进行右旋；然后将P涂黑，将GP涂红。
              */

              
            }



          } else {
            //情况3, 父亲是红色，叔叔也是红色，则递归，为父叔涂黑色，祖父红色
            uncle.isBlack = true;
            parent.isBlack = true;
            grandpa.isBlack = false;
            balanceNode(grandpa); //递归祖父涂色
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
}