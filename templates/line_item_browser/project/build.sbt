resolvers := Seq(
  "marmolata" at "http://vm-marmolata.eaalab.hpi.uni-potsdam.de/nexus/",
  "marmolata-alternative" at "https://jaheba.github.io/marmolata-mirror/nexus/",
  DefaultMavenRepository,
  Resolver.sbtPluginRepo("releases")
)
addSbtPlugin("com.sap.marmolata" % "sbt-application" % "0.0.1-master.24")
addSbtPlugin("io.get-coursier" % "sbt-coursier" % "1.0.0-RC3")