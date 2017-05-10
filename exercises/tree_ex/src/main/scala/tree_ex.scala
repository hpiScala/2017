object tree_ex {

  sealed trait Tree[T]
  case class LeafNode[T](info: T) extends Tree[T]
  case class InnerNode[T](left: Tree[T], info: T, right: Tree[T]) extends Tree[T]

  def countNodes[T](tree: Tree[T]): Int =
    tree match {
      case LeafNode(_)               => 1
      case InnerNode(left, _, right) => 1 + countNodes(left) + countNodes(right)
    }

  def height[T](tree: Tree[T]): Int =
    ???

  def sum(tree: Tree[Int]): Int =
    ???

  def map[A, B](f: A => B)(tree: Tree[A]): Tree[B] =
    ???

  import scala.collection.immutable._

  def toList[T](tree: Tree[T]): List[T] =
    ???
}

