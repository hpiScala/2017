import sbt.Keys._
import sbt.Project
import com.sap.marmolata.sbt.Import._
import com.sap.marmolata.sbt.MarmolataRootProject

lazy val commonSettings = Seq(
  organization := "com.sap",
  name := "displayLineItems", 
  version := "0.1-SNAPSHOT",
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

lazy val displayLineItemsRoot: Project = (project in file("."))
  .enablePlugins(MarmolataRootProject)
  .settings(commonSettings: _*)
  .aggregate(displayLineItemsJS, displayLineItemsJVM)

lazy val displayLineItems = (crossProject in file("."))
  .marmolataCrossProject("displayLineItems")
  .jsSettings(commonSettings: _*)
  .jvmSettings(commonSettings: _*)
  .jsSettings(
    fastOptJS in Compile := (fastOptJS in Compile dependsOn (unjarUI)).value,
    fullOptJS in Compile := (fullOptJS in Compile dependsOn (unjarUI)).value
  )
  .jvmSettings(
    libraryDependencies += Dependencies.ngdbc.value % "compile,test,it"
  )

lazy val displayLineItemsJS: Project = displayLineItems.js
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies += "com.sap.marmolata" %%%! "app" % "hpi-5",
    libraryDependencies += "com.sap.marmolata" %%%! "erp-custom-hpb" % "hpi-6",
    libraryDependencies += "com.sap.marmolata" %%%! "data-sql" % "hpi-19"
  )

lazy val displayLineItemsJVM: Project = displayLineItems.jvm
  .settings(commonSettings: _*)
  .settings(
    libraryDependencies += "com.sap.marmolata" %% "app" % "hpi-5",
    libraryDependencies += "com.sap.marmolata" %% "erp-custom-hpb" % "hpi-6"
  )
