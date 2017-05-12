object tree_ex {

  sealed trait Tree[+T]
  case object Empty extends Tree[Nothing]
  case class Node[+T](left: Tree[T], info: T, right: Tree[T]) extends Tree[T]

  def countNodes[T](tree: Tree[T]): Int =
    tree match { 
      case Empty                => 1
      case Node(left, _, right) => 1 + countNodes(left) + countNodes(right)
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

