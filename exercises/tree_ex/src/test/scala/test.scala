import org.scalatest.FlatSpec

class TreeSpec extends FlatSpec {
  import tree_ex._

  val t = InnerNode(LeafNode(1), 2, LeafNode(3))

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
    assert(map((_: Int) + 1)(t) == InnerNode(LeafNode(2),3,LeafNode(4)))
  }
  
  it should "compute to list" in {
    assert(toList(t) == List(1, 2, 3))
  }
}
