resolvers := Seq(
  Resolver.url("local", new URL(Path.userHome.asFile.toURI.toURL + "/.ivy2/local"))(Resolver.ivyStylePatterns),
  "marmolata-snapshots" at "http://vm-marmolata.eaalab.hpi.uni-potsdam.de/nexus/",
  "marmolata-alternative" at "https://jaheba.github.io/marmolata-mirror/nexus/")
externalResolvers := resolvers.value
addSbtPlugin("com.sap.marmolata" % "sbt-application" % "0.0.1-master.14")
libraryDependencies += "org.scala-js" %% "scalajs-env-selenium" % "0.1.3"

