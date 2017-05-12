import org.scalatest.FlatSpec

class TreeSpec extends FlatSpec {
  import tree_ex._

  val t = Node(Node(Empty, 1, Empty), 2, Node(Empty, 3, Empty))

  it should "count correctly" in {
    assert(countNodes(t) == 3)
  }
  
  it should "compute the height correctly" in {
    assert(height(t) == 2)
  }
  
  it should "compute the sum correctly" in {
    assert(sum(t) == 6)
  }
  
  it should "compute map" in {
    assert(map((_: Int) + 1)(t) == Node(Node(Empty, 2, Empty), 3, Node(Empty, 4, Empty)))
  }
  
  it should "compute to list" in {
    assert(toList(t) == List(1, 2, 3))
  }
}
