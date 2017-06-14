lazy val commonSettings = Seq(
  organization := "com.sap",
  version := "0.0.1-SNAPSHOT",
  resolvers := Seq(
    Resolver.url("local", new URL(Path.userHome.asFile.toURI.toURL + "/.ivy2/local"))(Resolver.ivyStylePatterns),
    DefaultMavenRepository,
    Resolver.sonatypeRepo("public"),
    Resolver.typesafeRepo("releases"),
    Resolver.sbtPluginRepo("releases"),
    "marmolata" at "http://vm-marmolata.eaalab.hpi.uni-potsdam.de/nexus/",
    "marmolata-alternative" at "https://jaheba.github.io/marmolata-mirror/nexus/"
  ),
  externalResolvers := resolvers.value
)

lazy val root = project.in(file("."))
  .enablePlugins(MarmolataSbtPlugin)
  .settings(isScalaJSProject := false)
  .settings(commonSettings: _*)
  .settings(libraryDependencies += "com.sap.marmolata" %% "reactive-impl-scalarx" % "0.3.0")
